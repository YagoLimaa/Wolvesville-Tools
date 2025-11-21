import express from 'express';
import axios from 'axios';
import { WOLVESVILLE_API_BASE_URL } from '../utils/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function to recursively extract and flatten roles, handling complex structures.
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
    return [roleInfo];
  }
  return [];
};

async function handleRoleRotations(req, res) {
  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roleRotations`;
  const response = await axios.get(requestUrl, req.requestConfig);

  const rotationsFromApi = Array.isArray(response.data) ? response.data : [];

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
          probability: setupProbability <= 1 ? setupProbability * 100 : setupProbability,
          roles: processedRoles,
        };
      });

      return {
        gameMode,
        gameModeName,
        setups,
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

  res.json(sortedRotations);
}

router.get('/', asyncHandler(async (req, res) => {
  if (req.baseUrl.includes('roleRotations')) {
    return handleRoleRotations(req, res);
  }

  const requestUrl = `${WOLVESVILLE_API_BASE_URL}/roles`;
  const response = await axios.get(requestUrl, req.requestConfig);
  res.json(response.data);
}));

router.get('/rotations', asyncHandler(handleRoleRotations));

export default router;