"""
AarnaRegistry — Box-storage version
====================================
Lifecycle: SUBMIT → REVIEW → VERIFY / REJECT → ISSUE → TRADE

Status codes: 1=pending  2=verified  3=rejected  4=issued
"""

from algopy import (
    ARC4Contract,
    Asset,
    BoxMap,
    Global,
    Txn,
    UInt64,
    arc4,
    itxn,
    subroutine,
)


# ── ABI Structs ────────────────────────────────────────────────────────────
class ProjectRecord(arc4.Struct):
    submitter: arc4.Address
    name: arc4.String
    location: arc4.String
    ecosystem: arc4.String
    cid: arc4.String
    status: arc4.UInt64
    credits: arc4.UInt64


class ListingRecord(arc4.Struct):
    seller: arc4.Address
    amount: arc4.UInt64
    price: arc4.UInt64
    active: arc4.UInt64


# ── Contract ────────────────────────────────────────────────────────────────
class AarnaRegistry(ARC4Contract):
    def __init__(self) -> None:
        # ── Role-based access control ──
        self.admin: arc4.Address = arc4.Address(Global.zero_address)
        self.validator: arc4.Address = arc4.Address(Global.zero_address)

        # ── AARNA token (ASA) ──
        self.aarna_asset: UInt64 = UInt64(0)

        # ── Counters ──
        self.project_count: UInt64 = UInt64(0)
        self.total_credits_issued: UInt64 = UInt64(0)
        self.listing_count: UInt64 = UInt64(0)

        # ── Box storage ──
        self.projects = BoxMap(UInt64, ProjectRecord, key_prefix=b"p")
        self.listings = BoxMap(UInt64, ListingRecord, key_prefix=b"l")

    # ══════════════════════════════════════════════════════════════════════
    # Internal helpers
    # ══════════════════════════════════════════════════════════════════════
    @subroutine
    def _only_admin(self) -> None:
        assert Txn.sender == self.admin.native, "unauthorized: admin only"

    @subroutine
    def _only_validator(self) -> None:
        assert Txn.sender == self.validator.native, "unauthorized: validator only"

    # ══════════════════════════════════════════════════════════════════════
    # Lifecycle / Admin
    # ══════════════════════════════════════════════════════════════════════
    @arc4.abimethod(create="require")
    def init(self) -> None:
        """Deploy the contract and set the caller as admin."""
        self.admin = arc4.Address(Txn.sender)

    @arc4.abimethod
    def set_validator(self, addr: arc4.Address) -> None:
        """Admin assigns a validator address for project reviews."""
        self._only_admin()
        self.validator = addr.copy()

    @arc4.abimethod
    def transfer_admin(self, new_admin: arc4.Address) -> None:
        """Admin transfers ownership to a new admin account."""
        self._only_admin()
        assert new_admin.native != Global.zero_address, "invalid: zero address"
        self.admin = new_admin.copy()

    # ══════════════════════════════════════════════════════════════════════
    # AARNA Token
    # ══════════════════════════════════════════════════════════════════════
    @arc4.abimethod
    def ensure_token(self) -> arc4.UInt64:
        """Create the AARNA ASA if it doesn't exist. Returns the ASA ID."""
        self._only_admin()
        if not self.aarna_asset:
            result = itxn.AssetConfig(
                total=10_000_000,
                decimals=0,
                default_frozen=False,
                unit_name="AARNA",
                asset_name="Aarna Carbon Credit",
                url="https://aarna.eco",
                manager=Global.current_application_address,
                reserve=Global.current_application_address,
                freeze=Global.current_application_address,
                clawback=Global.current_application_address,
            ).submit()
            self.aarna_asset = result.created_asset.id
        return arc4.UInt64(self.aarna_asset)

    # ══════════════════════════════════════════════════════════════════════
    # Project Lifecycle
    # ══════════════════════════════════════════════════════════════════════
    @arc4.abimethod
    def submit_project(
        self,
        name: arc4.String,
        location: arc4.String,
        ecosystem: arc4.String,
        cid: arc4.String,
    ) -> arc4.UInt64:
        """Developer submits a new project. Returns the project index."""
        idx = self.project_count
        self.projects[idx] = ProjectRecord(
            submitter=arc4.Address(Txn.sender),
            name=name,
            location=location,
            ecosystem=ecosystem,
            cid=cid,
            status=arc4.UInt64(1),
            credits=arc4.UInt64(0),
        )
        self.project_count = idx + UInt64(1)
        return arc4.UInt64(idx)

    @arc4.abimethod
    def approve_project(self, project_id: arc4.UInt64, credits: arc4.UInt64) -> None:
        """Validator approves a project and assigns a credit amount."""
        self._only_validator()
        pid = project_id.native
        assert pid < self.project_count, "invalid project id"
        assert credits.native > UInt64(0), "credits must be > 0"
        record = self.projects[pid].copy()
        assert record.status == arc4.UInt64(1), "project not pending"
        record.status = arc4.UInt64(2)
        record.credits = credits
        self.projects[pid] = record.copy()

    @arc4.abimethod
    def reject_project(self, project_id: arc4.UInt64) -> None:
        """Validator rejects a pending project."""
        self._only_validator()
        pid = project_id.native
        assert pid < self.project_count, "invalid project id"
        record = self.projects[pid].copy()
        assert record.status == arc4.UInt64(1), "project not pending"
        record.status = arc4.UInt64(3)
        self.projects[pid] = record.copy()

    @arc4.abimethod
    def issue_credits(self, project_id: arc4.UInt64) -> arc4.UInt64:
        """
        Validator issues AARNA tokens to submitter.
        Status: 2 (verified) → 4 (issued). Prevents double-issuance.
        """
        self._only_validator()
        assert self.aarna_asset, "no AARNA token created"
        pid = project_id.native
        assert pid < self.project_count, "invalid project id"
        record = self.projects[pid].copy()
        assert record.status == arc4.UInt64(2), "project not verified"

        itxn.AssetTransfer(
            xfer_asset=Asset(self.aarna_asset),
            asset_receiver=record.submitter.native,
            asset_amount=record.credits.native,
        ).submit()

        record.status = arc4.UInt64(4)
        self.projects[pid] = record.copy()
        creds = record.credits.native
        self.total_credits_issued = self.total_credits_issued + creds
        return arc4.UInt64(creds)

    # ══════════════════════════════════════════════════════════════════════
    # Marketplace
    # ══════════════════════════════════════════════════════════════════════
    @arc4.abimethod
    def list_for_sale(
        self,
        amount: arc4.UInt64,
        price_per_token: arc4.UInt64,
    ) -> arc4.UInt64:
        """
        List AARNA tokens for sale using clawback to escrow.
        Returns the listing index.
        """
        assert self.aarna_asset, "no AARNA token"
        assert amount.native > UInt64(0), "amount must be > 0"
        assert price_per_token.native > UInt64(0), "price must be > 0"

        itxn.AssetTransfer(
            xfer_asset=Asset(self.aarna_asset),
            asset_sender=Txn.sender,
            asset_receiver=Global.current_application_address,
            asset_amount=amount.native,
        ).submit()

        idx = self.listing_count
        self.listings[idx] = ListingRecord(
            seller=arc4.Address(Txn.sender),
            amount=amount,
            price=price_per_token,
            active=arc4.UInt64(1),
        )
        self.listing_count = idx + UInt64(1)
        return arc4.UInt64(idx)

    @arc4.abimethod
    def buy_listing(self, listing_id: arc4.UInt64, payment: arc4.UInt64) -> None:
        """
        Buy tokens from a listing. Transfers tokens to buyer and ALGO to seller.
        """
        assert self.aarna_asset, "no AARNA token"
        lid = listing_id.native
        assert lid < self.listing_count, "invalid listing id"
        record = self.listings[lid].copy()
        assert record.active == arc4.UInt64(1), "listing not active"

        total_cost = record.amount.native * record.price.native
        assert payment.native >= total_cost, "insufficient payment"

        itxn.AssetTransfer(
            xfer_asset=Asset(self.aarna_asset),
            asset_receiver=Txn.sender,
            asset_amount=record.amount.native,
        ).submit()

        itxn.Payment(
            receiver=record.seller.native,
            amount=total_cost,
        ).submit()

        record.active = arc4.UInt64(0)
        self.listings[lid] = record.copy()

    @arc4.abimethod
    def cancel_listing(self, listing_id: arc4.UInt64) -> None:
        """Seller cancels their listing. Escrowed tokens returned."""
        lid = listing_id.native
        assert lid < self.listing_count, "invalid listing id"
        record = self.listings[lid].copy()
        assert record.active == arc4.UInt64(1), "listing not active"
        assert Txn.sender == record.seller.native, "only seller can cancel"

        itxn.AssetTransfer(
            xfer_asset=Asset(self.aarna_asset),
            asset_receiver=record.seller.native,
            asset_amount=record.amount.native,
        ).submit()

        record.active = arc4.UInt64(0)
        self.listings[lid] = record.copy()

    # ══════════════════════════════════════════════════════════════════════
    # Read-Only Getters — field access from arc4.Struct copy
    # ══════════════════════════════════════════════════════════════════════
    @arc4.abimethod(readonly=True)
    def get_project_count(self) -> arc4.UInt64:
        return arc4.UInt64(self.project_count)

    @arc4.abimethod(readonly=True)
    def get_asset_id(self) -> arc4.UInt64:
        return arc4.UInt64(self.aarna_asset)

    @arc4.abimethod(readonly=True)
    def get_admin(self) -> arc4.Address:
        return self.admin.copy()

    @arc4.abimethod(readonly=True)
    def get_validator(self) -> arc4.Address:
        return self.validator.copy()

    @arc4.abimethod(readonly=True)
    def get_total_credits_issued(self) -> arc4.UInt64:
        return arc4.UInt64(self.total_credits_issued)

    @arc4.abimethod(readonly=True)
    def get_project(self, project_id: arc4.UInt64) -> ProjectRecord:
        return self.projects[project_id.native].copy()

    @arc4.abimethod(readonly=True)
    def get_listing(self, listing_id: arc4.UInt64) -> ListingRecord:
        return self.listings[listing_id.native].copy()

    @arc4.abimethod(readonly=True)
    def get_listing_count(self) -> arc4.UInt64:
        return arc4.UInt64(self.listing_count)
