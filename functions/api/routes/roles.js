import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { jsonResponse } from '../utils/response.js';

export async function handleRoles(request) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
  const response = await fetch(requestUrl, request.requestConfig);
  const responseData = await response.json();
  return jsonResponse(responseData);
}

export async function handleRoleRotations(request) {
  const response = await fetch(`${WOLVESVILLE_API_BASE_URL}/roleRotations`, request.requestConfig);
  const responseData = await response.json();
  const rotationsFromApi = Array.isArray(responseData) ? responseData : [];

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

  const formattedRotations = rotationsFromApi.map(rotationData => {
    const gameMode = rotationData?.gameMode ?? '';
    const gameModeName = (rotationData?.gameModeName || gameMode.replace(/-/g, ' ')).replace(/\b\w/g, l => l.toUpperCase());

    if (gameMode === 'sandbox' && Array.isArray(rotationData.roleRotations)) {
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

      return {
        gameMode,
        gameModeName,
        setups,
      };
    } else if (gameMode === 'sandbox' && !Array.isArray(rotationData.roleRotations)) {
      return {
        gameMode,
        gameModeName,
      };
    } else {
      const rolesSource = rotationData?.roleRotations?.[0]?.roleRotation?.roles ?? [];
      const roles = extractRoles(rolesSource);
      return {
        gameMode,
        gameModeName,
        roles,
      };
    }
  });

  const filteredRotations = formattedRotations.filter(rotation =>
    rotation.gameMode !== 'ranked-league-silver' && rotation.gameMode !== 'ranked-league-gold'
  );

  const desiredOrder = ['quick', 'crazy-fun', 'advanced', 'sandbox'];
  const sortedRotations = filteredRotations.sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.gameMode);
    const indexB = desiredOrder.indexOf(b.gameMode);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return jsonResponse(sortedRotations);
}