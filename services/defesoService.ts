import { DefesoInfo } from '../types';

const CACHE_KEY = 'defeso_data_cache';
const CACHE_TIMESTAMP_KEY = 'defeso_data_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface DefesoDataResponse {
    data: DefesoInfo;
    lastUpdated: number;
    source: 'cache' | 'network';
}

// Definition of a Defeso Period (Day/Month)
interface DefesoDefinition {
    species: string;
    description: string;
    startDay: number;
    startMonth: number; // 0-indexed (0 = Jan, 11 = Dec)
    endDay: number;
    endMonth: number;
}

// Official Defeso Definitions by Region (Portarias)
const DEFESO_DEFINITIONS: Record<string, DefesoDefinition> = {
    'Norte - Bacia Amazônica': {
        species: 'Tambaqui / Pirarucu',
        description: 'Período de reprodução. Proibida a pesca de espécies nativas.',
        startDay: 15,
        startMonth: 10, // Nov (10)
        endDay: 15,
        endMonth: 2, // Mar (2)
    },
    'Nordeste - Bacia do Parnaíba': {
        species: 'Lagosta / Camarão',
        description: 'Defeso para preservação dos estoques pesqueiros.',
        startDay: 1,
        startMonth: 1, // Feb (1)
        endDay: 30,
        endMonth: 3, // Apr (3)
    },
    'Centro-Oeste - Bacia do Paraguai': {
        species: 'Piracema (Geral)',
        description: 'Proteção à reprodução natural dos peixes.',
        startDay: 5,
        startMonth: 10, // Nov (10)
        endDay: 28,
        endMonth: 1, // Feb (1)
    },
    'Sudeste - Bacia do Paraná': {
        species: 'Piracema',
        description: 'Período de defeso para proteção da ictiofauna.',
        startDay: 1,
        startMonth: 10, // Nov (10)
        endDay: 28,
        endMonth: 1, // Feb (1)
    },
    'default': {
        species: 'Espécies Nativas',
        description: 'Período de defeso geral para reprodução.',
        startDay: 1,
        startMonth: 10, // Nov
        endDay: 28,
        endMonth: 1, // Feb
    }
};

const calculateDefesoInfo = (region: string): DefesoInfo => {
    const def = DEFESO_DEFINITIONS[region] || DEFESO_DEFINITIONS['default'];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Determine current/upcoming period years
    let startYear = currentYear;
    let endYear = currentYear;

    // Adjust years if period wraps around (e.g., Nov to Feb)
    if (def.startMonth > def.endMonth) {
        endYear = currentYear + 1;
        // If we are currently in Jan/Feb (before endMonth), the period started last year
        if (now.getMonth() <= def.endMonth) {
            startYear = currentYear - 1;
            endYear = currentYear;
        }
        // If we are after endMonth but before startMonth, the NEXT period starts this year
        else if (now.getMonth() < def.startMonth) {
            startYear = currentYear;
            endYear = currentYear + 1;
        }
    } else {
        // Period within same year (e.g., Feb to Apr)
        // If passed, move to next year
        if (now.getMonth() > def.endMonth || (now.getMonth() === def.endMonth && now.getDate() > def.endDay)) {
            startYear = currentYear + 1;
            endYear = currentYear + 1;
        }
    }

    const startDate = new Date(startYear, def.startMonth, def.startDay);
    const endDate = new Date(endYear, def.endMonth, def.endDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today

    let status: 'upcoming' | 'ongoing' | 'finished' = 'upcoming';
    let daysRemaining = 0;

    if (today >= startDate && today <= endDate) {
        status = 'ongoing';
        daysRemaining = 0; // Or days until end? Usually UI shows days TO start if upcoming.
    } else if (today < startDate) {
        status = 'upcoming';
        const diffTime = Math.abs(startDate.getTime() - today.getTime());
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
        status = 'finished'; // Should be rare with logic above moving to next year logic
    }

    // Format dates DD/MM/YYYY
    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');

    // Generate Mock History
    const history = [
        {
            id: 'h1',
            species: def.species,
            region: region,
            startDate: formatDate(new Date(startYear - 1, def.startMonth, def.startDay)),
            endDate: formatDate(new Date(endYear - 1, def.endMonth, def.endDay)),
            status: 'finished' as const,
            paymentStatus: 'paid' as const,
            paymentDate: `15/04/${endYear - 1}`
        },
        {
            id: 'h2',
            species: def.species,
            region: region,
            startDate: formatDate(new Date(startYear - 2, def.startMonth, def.startDay)),
            endDate: formatDate(new Date(endYear - 2, def.endMonth, def.endDay)),
            status: 'finished' as const,
            paymentStatus: 'paid' as const,
            paymentDate: `10/04/${endYear - 2}`
        }
    ];

    return {
        species: def.species,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        daysRemaining,
        hasRight: true, // Mocked for now
        region: region,
        description: def.description,
        status,
        history
    };
};

export const fetchDefesoData = async (region: string, forceRefresh = false): Promise<DefesoDataResponse> => {
    // Check Cache (Optional: disable for dynamic date testing)
    // For now, let's recalculate always to be accurate with system date

    // Simulate Network Request (fast)
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = calculateDefesoInfo(region);

    return {
        data,
        lastUpdated: Date.now(),
        source: 'network'
    };
};
