import { DefesoInfo } from '../types';

const CACHE_KEY = 'defeso_data_cache';
const CACHE_TIMESTAMP_KEY = 'defeso_data_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface DefesoDataResponse {
    data: DefesoInfo;
    lastUpdated: number;
    source: 'cache' | 'network';
}

// Mock database of regional defesos
const MOCK_DB: Record<string, DefesoInfo> = {
    'Norte - Bacia Amazônica': {
        species: 'Tambaqui',
        startDate: '01/12/2026',
        endDate: '30/03/2027',
        daysRemaining: 45,
        hasRight: true,
        region: 'Norte - Bacia Amazônica',
        description: 'Período de reprodução. Proibida a pesca de espécies nativas.',
        status: 'upcoming',
        history: [
            { id: 'h1', species: 'Tambaqui', region: 'Norte - Bacia Amazônica', startDate: '01/12/2024', endDate: '30/03/2025', status: 'finished', paymentStatus: 'paid', paymentDate: '15/04/2025' },
            { id: 'h2', species: 'Tambaqui', region: 'Norte - Bacia Amazônica', startDate: '01/12/2023', endDate: '30/03/2024', status: 'finished', paymentStatus: 'paid', paymentDate: '10/04/2024' },
            { id: 'h3', species: 'Pirarucu', region: 'Norte - Bacia Amazônica', startDate: '01/12/2022', endDate: '30/03/2023', status: 'finished', paymentStatus: 'paid', paymentDate: '12/04/2023' }
        ]
    },
    'Nordeste - Bacia do Parnaíba': {
        species: 'Camarão Rosa',
        startDate: '01/12/2025',
        endDate: '31/05/2026',
        daysRemaining: 20,
        hasRight: true,
        region: 'Nordeste - Bacia do Parnaíba',
        description: 'Defeso do camarão em águas costeiras.',
        status: 'ongoing',
        history: [
            { id: 'h4', species: 'Camarão Rosa', region: 'Nordeste', startDate: '01/12/2024', endDate: '31/05/2025', status: 'finished', paymentStatus: 'paid', paymentDate: '15/06/2025' },
            { id: 'h5', species: 'Camarão Rosa', region: 'Nordeste', startDate: '01/12/2023', endDate: '31/05/2024', status: 'finished', paymentStatus: 'paid', paymentDate: '20/06/2024' }
        ]
    },
    'Centro-Oeste - Bacia do Paraguai': {
        species: 'Piracema (Geral)',
        startDate: '05/11/2025',
        endDate: '28/02/2026',
        daysRemaining: 15,
        hasRight: true,
        region: 'Centro-Oeste - Bacia do Paraguai',
        description: 'Proteção à reprodução natural dos peixes.',
        status: 'ongoing',
        history: [
            { id: 'h6', species: 'Piracema', region: 'Centro-Oeste', startDate: '05/11/2024', endDate: '28/02/2025', status: 'finished', paymentStatus: 'paid', paymentDate: '10/03/2025' }
        ]
    },
    'Sudeste - Bacia do Paraná': {
        species: 'Piracema',
        startDate: '01/11/2025',
        endDate: '28/02/2026',
        daysRemaining: 15,
        hasRight: true,
        region: 'Sudeste - Bacia do Paraná',
        description: 'Período de defeso para proteção da ictiofauna.',
        status: 'ongoing',
        history: [
            { id: 'h7', species: 'Piracema', region: 'Sudeste', startDate: '01/11/2024', endDate: '28/02/2025', status: 'finished', paymentStatus: 'paid', paymentDate: '15/03/2025' }
        ]
    },
    // Fallback
    'default': {
        species: 'Tambaqui',
        startDate: '01/12/2025',
        endDate: '30/03/2026',
        daysRemaining: 12,
        hasRight: true,
        region: 'Norte - Bacia Amazônica',
        description: 'Período de reprodução. Proibida a pesca.',
        status: 'upcoming'
    }
};

export const fetchDefesoData = async (region: string, forceRefresh = false): Promise<DefesoDataResponse> => {
    // Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    if (!forceRefresh && cachedData && cachedTime) {
        const age = now - parseInt(cachedTime);
        if (age < CACHE_DURATION) {
            console.log("Serving Defeso data from cache");
            return {
                data: JSON.parse(cachedData),
                lastUpdated: parseInt(cachedTime),
                source: 'cache'
            };
        }
    }

    // Simulate Network Request
    console.log("Fetching Defeso data from network...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay

    const data = MOCK_DB[region] || MOCK_DB['default'];

    // Update Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

    return {
        data,
        lastUpdated: now,
        source: 'network'
    };
};
