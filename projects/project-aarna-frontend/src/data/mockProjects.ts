export interface MockProject {
    id: number
    name: string
    location: string
    ecosystem: string
    cid: string
    status: 'pending' | 'verified' | 'rejected'
    credits: number
    coordinates: [number, number]
    description: string
    area_hectares: number
    carbon_tonnes: number
    submitted_by: string
    image_url: string
}

export const MOCK_PROJECTS: MockProject[] = [
    {
        id: 0,
        name: 'Sundarbans Mangrove Restoration',
        location: 'West Bengal, India',
        ecosystem: 'Mangrove',
        cid: 'bafybeigdyrztj3nx7udgnhvtm5jcx2albiuqac3entqz4rx4yz4thwqvai',
        status: 'verified',
        credits: 2500,
        coordinates: [21.9497, 88.8985],
        description:
            'Large-scale replanting of Rhizophora and Avicennia mangrove species across 340 hectares of degraded tidal flats in the Sundarbans biosphere reserve.',
        area_hectares: 340,
        carbon_tonnes: 12500,
        submitted_by: 'Sundarbans Development Board',
        image_url: '/mangrove-sundarbans.jpg',
    },
    {
        id: 1,
        name: 'Pichavaram Mangrove Conservation',
        location: 'Tamil Nadu, India',
        ecosystem: 'Mangrove',
        cid: 'bafybeih5rpfxzqe3i4q7kzr4yvw6dmcxnqh5mfkj2zxa3qw7yuj7kqvtae',
        status: 'verified',
        credits: 1800,
        coordinates: [11.4290, 79.7774],
        description:
            'Conservation and monitoring of the second-largest mangrove forest in the world, using satellite imagery and IoT sensors for continuous carbon stock assessment.',
        area_hectares: 1100,
        carbon_tonnes: 8400,
        submitted_by: 'Tamil Nadu Forest Dept.',
        image_url: '/mangrove-pichavaram.jpg',
    },
    {
        id: 2,
        name: 'Gulf of Kutch Seagrass Monitoring',
        location: 'Gujarat, India',
        ecosystem: 'Seagrass',
        cid: 'bafybeiczsscdsbs7fkpawkb2rv2h67csp3aag4eurux3nfxkkqb7oqy55a',
        status: 'pending',
        credits: 0,
        coordinates: [22.4707, 69.0800],
        description:
            'Systematic monitoring of seagrass meadows (Halophila, Halodule) in the Gulf of Kutch Marine National Park, measuring carbon sequestration capacity.',
        area_hectares: 450,
        carbon_tonnes: 0,
        submitted_by: 'Gujarat Ecology Commission',
        image_url: '/seagrass-kutch.jpg',
    },
    {
        id: 3,
        name: 'Chilika Wetland Carbon Assessment',
        location: 'Odisha, India',
        ecosystem: 'Wetland',
        cid: 'bafybeigdyrztj3nx7udgnhvtm5jcx2albiuqac3entqz4rx4yz4theabcd',
        status: 'pending',
        credits: 0,
        coordinates: [19.7200, 85.3200],
        description:
            'Comprehensive carbon stock assessment of Asia\'s largest brackish water lagoon, encompassing mangroves, salt marshes, and seagrass beds.',
        area_hectares: 1165,
        carbon_tonnes: 0,
        submitted_by: 'Chilika Development Authority',
        image_url: '/wetland-chilika.jpg',
    },
]

export const IMPACT_STATS = {
    projectsVerified: 2,
    totalCredits: 4300,
    coastlineCovered: '2,400 km',
    ecosystemsMonitored: 4,
    carbonSequestered: '20,900 tonnes',
    communitiesEmpowered: 12,
}
