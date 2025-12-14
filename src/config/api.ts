const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/projects`,
  blocks: `${API_BASE_URL}/api/blocks`,
  deploy: {
    subdomain: `${API_BASE_URL}/api/deploy/subdomain`,
    domain: `${API_BASE_URL}/api/deploy/domain`,
    publish: `${API_BASE_URL}/api/deploy/publish`,
    status: (deploymentId: number) => `${API_BASE_URL}/api/deploy/status/${deploymentId}`,
    rollback: `${API_BASE_URL}/api/deploy/rollback`,
  },
  domains: {
    check: `${API_BASE_URL}/api/domains/check`,
    checkDns: `${API_BASE_URL}/api/domains/check-dns`,
    generateVerificationToken: `${API_BASE_URL}/api/domains/generate-verification-token`,
    verify: `${API_BASE_URL}/api/domains/verify`,
  },
  monitoring: {
    get: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/monitoring`,
    logs: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/logs`,
    analytics: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/deployment-analytics`,
  },
  versions: {
    list: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/versions`,
    create: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/versions`,
    load: (projectId: number, versionId: number) => `${API_BASE_URL}/api/projects/${projectId}/versions/${versionId}/load`,
    rollback: (projectId: number) => `${API_BASE_URL}/api/projects/${projectId}/rollback`,
  },
};

export default API_ENDPOINTS;
