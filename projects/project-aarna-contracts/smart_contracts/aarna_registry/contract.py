"""
AarnaRegistry — Decentralized MRV for Blue Carbon Ecosystems
Algorand ARC-4 Smart Contract (AlgoPy / Puya)

Project Aarna tracks coastal carbon sequestration projects on-chain.
Developers submit project evidence (IPFS CID), validators review and approve,
and AARNA tokens are issued as carbon credits.
"""

from algopy import (
    ARC4Contract,
    Account,
    Asset,
    UInt64,
    Txn,
    Global,
    itxn,
    arc4,
    subroutine,
    String,
)


class AarnaRegistry(ARC4Contract):
    """
    On-chain registry for blue carbon ecosystem projects.

    Lifecycle: SUBMIT → REVIEW → VERIFY / REJECT → ISSUE CREDITS

    State layout (per-project, indexed by project_count):
      - project_{n}_submitter : Account
      - project_{n}_cid       : arc4.String  (IPFS content identifier)
      - project_{n}_name      : arc4.String
      - project_{n}_location  : arc4.String
      - project_{n}_ecosystem : arc4.String
      - project_{n}_status    : UInt64  (0=none, 1=pending, 2=verified, 3=rejected)
      - project_{n}_credits   : UInt64  (carbon credit amount)

    Since Algorand global state has limited slots, we store up to 8 projects
    using a flat approach with a rotating index.
    """

    def __init__(self) -> None:
        # Admin & validator roles
        self.admin: Account = Global.zero_address
        self.validator: Account = Global.zero_address

        # AARNA token (ASA)
        self.aarna_asset: Asset = Asset(0)

        # Project counter
        self.project_count: UInt64 = UInt64(0)

        # Flat project storage — supports up to 4 projects in global state
        # Project 0
        self.p0_submitter: Account = Global.zero_address
        self.p0_cid: arc4.String = arc4.String("")
        self.p0_name: arc4.String = arc4.String("")
        self.p0_location: arc4.String = arc4.String("")
        self.p0_ecosystem: arc4.String = arc4.String("")
        self.p0_status: UInt64 = UInt64(0)
        self.p0_credits: UInt64 = UInt64(0)

        # Project 1
        self.p1_submitter: Account = Global.zero_address
        self.p1_cid: arc4.String = arc4.String("")
        self.p1_name: arc4.String = arc4.String("")
        self.p1_location: arc4.String = arc4.String("")
        self.p1_ecosystem: arc4.String = arc4.String("")
        self.p1_status: UInt64 = UInt64(0)
        self.p1_credits: UInt64 = UInt64(0)

        # Project 2
        self.p2_submitter: Account = Global.zero_address
        self.p2_cid: arc4.String = arc4.String("")
        self.p2_name: arc4.String = arc4.String("")
        self.p2_location: arc4.String = arc4.String("")
        self.p2_ecosystem: arc4.String = arc4.String("")
        self.p2_status: UInt64 = UInt64(0)
        self.p2_credits: UInt64 = UInt64(0)

        # Project 3
        self.p3_submitter: Account = Global.zero_address
        self.p3_cid: arc4.String = arc4.String("")
        self.p3_name: arc4.String = arc4.String("")
        self.p3_location: arc4.String = arc4.String("")
        self.p3_ecosystem: arc4.String = arc4.String("")
        self.p3_status: UInt64 = UInt64(0)
        self.p3_credits: UInt64 = UInt64(0)

    # ─────────────── Initialization ─────────────── #

    @arc4.abimethod(create="require")
    def init(self) -> None:
        """Deploy and set the caller as admin."""
        self.admin = Txn.sender

    # ─────────────── Access Control ─────────────── #

    @subroutine
    def _only_admin(self) -> None:
        assert Txn.sender == self.admin, "unauthorized: admin only"

    @subroutine
    def _only_validator(self) -> None:
        assert Txn.sender == self.validator, "unauthorized: validator only"

    # ─────────────── Admin Methods ─────────────── #

    @arc4.abimethod
    def set_validator(self, addr: Account) -> None:
        """Admin sets the validator address."""
        self._only_admin()
        self.validator = addr

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
                manager=Global.current_application_address,
                reserve=Global.current_application_address,
                freeze=Global.current_application_address,
                clawback=Global.current_application_address,
            ).submit()
            self.aarna_asset = result.created_asset
        return arc4.UInt64(self.aarna_asset.id)

    # ─────────────── Project Submission ─────────────── #

    @arc4.abimethod
    def submit_project(
        self,
        name: arc4.String,
        location: arc4.String,
        ecosystem: arc4.String,
        cid: arc4.String,
    ) -> arc4.UInt64:
        """
        Developer submits a new blue carbon project.
        Returns the project index.
        """
        idx = self.project_count
        assert idx < UInt64(4), "max projects reached"

        sender = Txn.sender

        if idx == UInt64(0):
            self.p0_submitter = sender
            self.p0_name = name
            self.p0_location = location
            self.p0_ecosystem = ecosystem
            self.p0_cid = cid
            self.p0_status = UInt64(1)  # pending
            self.p0_credits = UInt64(0)
        elif idx == UInt64(1):
            self.p1_submitter = sender
            self.p1_name = name
            self.p1_location = location
            self.p1_ecosystem = ecosystem
            self.p1_cid = cid
            self.p1_status = UInt64(1)
            self.p1_credits = UInt64(0)
        elif idx == UInt64(2):
            self.p2_submitter = sender
            self.p2_name = name
            self.p2_location = location
            self.p2_ecosystem = ecosystem
            self.p2_cid = cid
            self.p2_status = UInt64(1)
            self.p2_credits = UInt64(0)
        else:
            self.p3_submitter = sender
            self.p3_name = name
            self.p3_location = location
            self.p3_ecosystem = ecosystem
            self.p3_cid = cid
            self.p3_status = UInt64(1)
            self.p3_credits = UInt64(0)

        self.project_count = idx + UInt64(1)
        return arc4.UInt64(idx)

    # ─────────────── Validator Methods ─────────────── #

    @arc4.abimethod
    def approve_project(self, project_id: UInt64, credits: UInt64) -> None:
        """Validator approves a project and assigns carbon credit amount."""
        self._only_validator()
        assert project_id < self.project_count, "invalid project"

        if project_id == UInt64(0):
            assert self.p0_status == UInt64(1), "not pending"
            self.p0_status = UInt64(2)
            self.p0_credits = credits
        elif project_id == UInt64(1):
            assert self.p1_status == UInt64(1), "not pending"
            self.p1_status = UInt64(2)
            self.p1_credits = credits
        elif project_id == UInt64(2):
            assert self.p2_status == UInt64(1), "not pending"
            self.p2_status = UInt64(2)
            self.p2_credits = credits
        else:
            assert self.p3_status == UInt64(1), "not pending"
            self.p3_status = UInt64(2)
            self.p3_credits = credits

    @arc4.abimethod
    def reject_project(self, project_id: UInt64) -> None:
        """Validator rejects a project."""
        self._only_validator()
        assert project_id < self.project_count, "invalid project"

        if project_id == UInt64(0):
            assert self.p0_status == UInt64(1), "not pending"
            self.p0_status = UInt64(3)
        elif project_id == UInt64(1):
            assert self.p1_status == UInt64(1), "not pending"
            self.p1_status = UInt64(3)
        elif project_id == UInt64(2):
            assert self.p2_status == UInt64(1), "not pending"
            self.p2_status = UInt64(3)
        else:
            assert self.p3_status == UInt64(1), "not pending"
            self.p3_status = UInt64(3)

    @arc4.abimethod
    def issue_credits(self, project_id: UInt64) -> arc4.UInt64:
        """
        Validator issues AARNA tokens to the project submitter
        based on approved carbon credits.
        """
        self._only_validator()
        assert self.aarna_asset, "no token created"
        assert project_id < self.project_count, "invalid project"

        if project_id == UInt64(0):
            assert self.p0_status == UInt64(2), "not approved"
            itxn.AssetTransfer(
                xfer_asset=self.aarna_asset,
                asset_receiver=self.p0_submitter,
                asset_amount=self.p0_credits,
            ).submit()
            return arc4.UInt64(self.p0_credits)
        elif project_id == UInt64(1):
            assert self.p1_status == UInt64(2), "not approved"
            itxn.AssetTransfer(
                xfer_asset=self.aarna_asset,
                asset_receiver=self.p1_submitter,
                asset_amount=self.p1_credits,
            ).submit()
            return arc4.UInt64(self.p1_credits)
        elif project_id == UInt64(2):
            assert self.p2_status == UInt64(2), "not approved"
            itxn.AssetTransfer(
                xfer_asset=self.aarna_asset,
                asset_receiver=self.p2_submitter,
                asset_amount=self.p2_credits,
            ).submit()
            return arc4.UInt64(self.p2_credits)
        else:
            assert self.p3_status == UInt64(2), "not approved"
            itxn.AssetTransfer(
                xfer_asset=self.aarna_asset,
                asset_receiver=self.p3_submitter,
                asset_amount=self.p3_credits,
            ).submit()
            return arc4.UInt64(self.p3_credits)

    # ─────────────── Read Methods ─────────────── #

    @arc4.abimethod(readonly=True)
    def get_project_count(self) -> arc4.UInt64:
        return arc4.UInt64(self.project_count)

    @arc4.abimethod(readonly=True)
    def get_asset_id(self) -> arc4.UInt64:
        return arc4.UInt64(self.aarna_asset.id)

    @arc4.abimethod(readonly=True)
    def get_project_status(self, project_id: UInt64) -> arc4.UInt64:
        if project_id == UInt64(0):
            return arc4.UInt64(self.p0_status)
        elif project_id == UInt64(1):
            return arc4.UInt64(self.p1_status)
        elif project_id == UInt64(2):
            return arc4.UInt64(self.p2_status)
        else:
            return arc4.UInt64(self.p3_status)

    @arc4.abimethod(readonly=True)
    def get_project_cid(self, project_id: UInt64) -> arc4.String:
        if project_id == UInt64(0):
            return self.p0_cid
        elif project_id == UInt64(1):
            return self.p1_cid
        elif project_id == UInt64(2):
            return self.p2_cid
        else:
            return self.p3_cid

    @arc4.abimethod(readonly=True)
    def get_project_name(self, project_id: UInt64) -> arc4.String:
        if project_id == UInt64(0):
            return self.p0_name
        elif project_id == UInt64(1):
            return self.p1_name
        elif project_id == UInt64(2):
            return self.p2_name
        else:
            return self.p3_name

    @arc4.abimethod(readonly=True)
    def get_project_location(self, project_id: UInt64) -> arc4.String:
        if project_id == UInt64(0):
            return self.p0_location
        elif project_id == UInt64(1):
            return self.p1_location
        elif project_id == UInt64(2):
            return self.p2_location
        else:
            return self.p3_location

    @arc4.abimethod(readonly=True)
    def get_project_credits(self, project_id: UInt64) -> arc4.UInt64:
        if project_id == UInt64(0):
            return arc4.UInt64(self.p0_credits)
        elif project_id == UInt64(1):
            return arc4.UInt64(self.p1_credits)
        elif project_id == UInt64(2):
            return arc4.UInt64(self.p2_credits)
        else:
            return arc4.UInt64(self.p3_credits)

    @arc4.abimethod(readonly=True)
    def get_project_submitter(self, project_id: UInt64) -> Account:
        if project_id == UInt64(0):
            return self.p0_submitter
        elif project_id == UInt64(1):
            return self.p1_submitter
        elif project_id == UInt64(2):
            return self.p2_submitter
        else:
            return self.p3_submitter

    @arc4.abimethod(readonly=True)
    def get_project_ecosystem(self, project_id: UInt64) -> arc4.String:
        if project_id == UInt64(0):
            return self.p0_ecosystem
        elif project_id == UInt64(1):
            return self.p1_ecosystem
        elif project_id == UInt64(2):
            return self.p2_ecosystem
        else:
            return self.p3_ecosystem
