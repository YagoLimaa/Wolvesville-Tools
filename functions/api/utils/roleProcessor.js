
const extractRoles = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data.flatMap(extractRoles);

    let roleId;
    let probability;

    if (typeof data === 'string') {
        roleId = data;
    } else if (data && typeof data.role === 'string') {
        roleId = data.role;
        if (typeof data.probability === 'number') {
            probability = data.probability;
        }
    } else if (data && Array.isArray(data.roles)) {
        return data.roles.flatMap(extractRoles);
    }

    if (roleId) {
        const roleInfo = { id: roleId === 'red-lady' ? 'harlot' : roleId };
        if (probability !== undefined) {
            roleInfo.probability = probability <= 1 ? probability * 100 : probability;
        }
        if (roleInfo.probability !== undefined && roleInfo.probability !== 50) {
            delete roleInfo.probability;
        }
        return [roleInfo];
    }
    return [];
};

const processSandboxRotation = (rotationData) => {
    const gameMode = rotationData?.gameMode ?? '';
    const gameModeName = (rotationData?.gameModeName || gameMode.replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase());

    if (!Array.isArray(rotationData.roleRotations)) {
        return { gameMode, gameModeName };
    }

    const processRole = (roleData) => {
        let roleId;
        let probability;

        if (typeof roleData === 'string') {
            roleId = roleData;
        } else if (roleData && typeof roleData.role === 'string') {
            roleId = roleData.role;
            if (typeof roleData.probability === 'number') {
                probability = roleData.probability;
            }
        }

        if (roleId) {
            const result = { id: roleId === 'red-lady' ? 'harlot' : roleId };
            if (probability !== undefined) {
                result.probability = probability <= 1 ? probability * 100 : probability;
            }
            return result;
        }
        return null;
    };

    const setups = rotationData.roleRotations.map(setupData => {
        const setupProbability = setupData.probability;
        const rolesSource = setupData.roleRotation?.roles ?? [];

        const processedRoles = rolesSource.map(roleOrChoice => {
            if (Array.isArray(roleOrChoice)) {
                return roleOrChoice.map(processRole).filter(Boolean);
            }
            return [processRole(roleOrChoice)].filter(Boolean);
        }).filter(r => r.length > 0);

        return {
            probability: setupProbability !== undefined ? (setupProbability <= 1 ? setupProbability * 100 : setupProbability) : undefined,
            roles: processedRoles,
        };
    });

    return { gameMode, gameModeName, setups };
};

const processStandardRotation = (rotationData) => {
    const gameMode = rotationData?.gameMode ?? '';
    const gameModeName = (rotationData?.gameModeName || gameMode.replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase());
    const rolesSource = rotationData?.roleRotations?.[0]?.roleRotation?.roles ?? [];
    const roles = extractRoles(rolesSource);
    return { gameMode, gameModeName, roles };
};

export function processRoleRotations(rotationsFromApi) {
    const formattedRotations = rotationsFromApi.map(rotationData => {
        if (rotationData?.gameMode === 'sandbox') {
            return processSandboxRotation(rotationData);
        }
        return processStandardRotation(rotationData);
    });

    const filteredRotations = formattedRotations.filter(rotation =>
        rotation.gameMode !== 'ranked-league-silver' && rotation.gameMode !== 'ranked-league-gold'
    );

    const desiredOrder = ['quick', 'crazy-fun', 'advanced', 'sandbox'];
    return filteredRotations.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.gameMode);
        const indexB = desiredOrder.indexOf(b.gameMode);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
}
