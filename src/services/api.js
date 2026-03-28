import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from './endpoints';

console.log('API_CONFIG:', API_CONFIG);
console.log('LOGIN_ENDPOINT:', ENDPOINTS.auth.login);

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('API REQUEST:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-Time'] = new Date().toISOString();
    config.headers['X-API-Version'] = API_CONFIG.VERSION;
    config.headers['X-Client-Type'] = API_CONFIG.CLIENT_TYPE;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          localStorage.removeItem('adminToken');
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: error.response.status === 401 ? 'unauthorized' : 'forbidden' }
          }));
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  auth: {
    login: (credentials) => api.post(ENDPOINTS.auth.login, credentials),
    logout: () => api.post(ENDPOINTS.auth.logout),
    refresh: () => api.post(ENDPOINTS.auth.refresh),
    register: (data) => api.post(ENDPOINTS.auth.register, data),
    forgotPassword: (email) => api.post(ENDPOINTS.auth.forgotPassword, { email }),
    resetPassword: (token, newPassword) => api.post(ENDPOINTS.auth.resetPassword, { token, newPassword }),
    getProfile: () => api.get(ENDPOINTS.auth.profile),
  },

  users: {
    list: (params) => api.get(ENDPOINTS.users.list, { params }),
    get: (id) => api.get(ENDPOINTS.users.get(id)),
    update: (id, data) => api.put(ENDPOINTS.users.update(id), data),
    delete: (id) => api.delete(ENDPOINTS.users.delete(id)),
  },

  sosAlerts: {
    list: (params) => api.get(ENDPOINTS.sosAlerts.list, { params }),
    get: (id) => api.get(ENDPOINTS.sosAlerts.get(id)),
    resolve: (id) => api.put(ENDPOINTS.sosAlerts.resolve(id)),
    notify: (id, data) => api.post(ENDPOINTS.sosAlerts.notify(id), data),
    emergencyContact: (id, data) => api.post(ENDPOINTS.sosAlerts.emergencyContact(id), data),
  },

  families: {
    list: (params) => api.get(ENDPOINTS.families.list, { params }),
    get: (id) => api.get(ENDPOINTS.families.get(id)),
    create: (data) => api.post(ENDPOINTS.families.create, data),
    update: (id, data) => api.put(ENDPOINTS.families.update(id), data),
    delete: (id) => api.delete(ENDPOINTS.families.delete(id)),
    notify: (id, data) => api.post(ENDPOINTS.families.notify(id), data),
  },

  devices: {
    list: (params) => api.get(ENDPOINTS.devices.list, { params }),
    get: (id) => api.get(ENDPOINTS.devices.get(id)),
    create: (data) => api.post(ENDPOINTS.devices.create, data),
    update: (id, data) => api.put(ENDPOINTS.devices.update(id), data),
    toggle: (id) => api.put(ENDPOINTS.devices.toggle(id)),
    delete: (id) => api.delete(ENDPOINTS.devices.delete(id)),
  },

  iot: {
    list: (params) => api.get(ENDPOINTS.iot.list, { params }),
    get: (id) => api.get(ENDPOINTS.iot.get(id)),
    create: (data) => api.post(ENDPOINTS.iot.create, data),
    update: (id, data) => api.put(ENDPOINTS.iot.update(id), data),
    control: (id, command) => api.post(ENDPOINTS.iot.control(id), command),
    toggle: (id) => api.put(ENDPOINTS.iot.toggle(id)),
    delete: (id) => api.delete(ENDPOINTS.iot.delete(id)),
    stats: () => api.get(ENDPOINTS.iot.stats),
  },

  tracking: {
    locations: (params) => api.get(ENDPOINTS.tracking.locations, { params }),
    family: (familyId, params) => api.get(ENDPOINTS.tracking.family(familyId), { params }),
    user: (userId) => api.get(ENDPOINTS.tracking.user(userId)),
    userHistory: (userId, params) => api.get(ENDPOINTS.tracking.userHistory(userId), { params }),
    getUserLocationHistory: (userId, params) => api.get(ENDPOINTS.tracking.userHistory(userId), { params }),
    nearby: (params) => api.get(ENDPOINTS.tracking.nearby, { params }),
    updateLocation: (userId, data) => api.post(ENDPOINTS.tracking.updateLocation(userId), data),
    predict: (userId, params) => api.get(ENDPOINTS.tracking.predict(userId), { params }),
    status: (userId) => api.get(ENDPOINTS.tracking.status(userId)),
    geofences: (params) => api.get(ENDPOINTS.tracking.geofences, { params }),
    createGeofence: (data) => api.post(ENDPOINTS.tracking.geofences, data),
    geofence: (id) => api.get(ENDPOINTS.tracking.geofence(id)),
    updateGeofence: (id, data) => api.put(ENDPOINTS.tracking.geofence(id), data),
    deleteGeofence: (id) => api.delete(ENDPOINTS.tracking.geofence(id)),
    heatmap: (params) => api.get(ENDPOINTS.tracking.heatmap, { params }),
  },

  content: {
    tips: (params) => api.get(ENDPOINTS.content.tips, { params }),
    tip: (id) => api.get(ENDPOINTS.content.tip(id)),
    addTip: (data) => api.post(ENDPOINTS.content.addTip, data),
    updateTip: (id, data) => api.put(ENDPOINTS.content.updateTip(id), data),
    deleteTip: (id) => api.delete(ENDPOINTS.content.deleteTip(id)),
    articles: (params) => api.get(ENDPOINTS.content.articles, { params }),
    article: (id) => api.get(ENDPOINTS.content.article(id)),
    addArticle: (data) => api.post(ENDPOINTS.content.addArticle, data),
    updateArticle: (id, data) => api.put(ENDPOINTS.content.updateArticle(id), data),
    deleteArticle: (id) => api.delete(ENDPOINTS.content.deleteArticle(id)),
    tutorials: (params) => api.get(ENDPOINTS.content.tutorials, { params }),
    tutorial: (id) => api.get(ENDPOINTS.content.tutorial(id)),
    createTutorial: (data) => api.post(ENDPOINTS.content.createTutorial, data),
    updateTutorial: (id, data) => api.put(ENDPOINTS.content.updateTutorial(id), data),
    deleteTutorial: (id) => api.delete(ENDPOINTS.content.deleteTutorial(id)),
    news: (params) => api.get(ENDPOINTS.content.news, { params }),
    newsItem: (id) => api.get(ENDPOINTS.content.newsItem(id)),
    createNews: (data) => api.post(ENDPOINTS.content.createNews, data),
    updateNews: (id, data) => api.put(ENDPOINTS.content.updateNews(id), data),
    deleteNews: (id) => api.delete(ENDPOINTS.content.deleteNews(id)),
    laws: (params) => api.get(ENDPOINTS.content.laws, { params }),
    law: (id) => api.get(ENDPOINTS.content.law(id)),
    createLaw: (data) => api.post(ENDPOINTS.content.createLaw, data),
    updateLaw: (id, data) => api.put(ENDPOINTS.content.updateLaw(id), data),
    deleteLaw: (id) => api.delete(ENDPOINTS.content.deleteLaw(id)),
    helplines: (params) => api.get(ENDPOINTS.content.helplines, { params }),
    helpline: (id) => api.get(ENDPOINTS.content.helpline(id)),
    createHelpline: (data) => api.post(ENDPOINTS.content.createHelpline, data),
    updateHelpline: (id, data) => api.put(ENDPOINTS.content.updateHelpline(id), data),
    deleteHelpline: (id) => api.delete(ENDPOINTS.content.deleteHelpline(id)),
  },

  settings: {
    get: () => api.get(ENDPOINTS.settings.get),
    update: (data) => api.put(ENDPOINTS.settings.update, data),
  },

  analytics: {
    stats: () => api.get(ENDPOINTS.analytics.stats),
    data: (params) => api.get(ENDPOINTS.analytics.data, { params }),
  },

  activity: {
    logs: (params) => api.get(ENDPOINTS.activity.logs, { params }),
  },

  grievance: {
    list: (params) => api.get(ENDPOINTS.grievance.list, { params }),
    get: (id) => api.get(ENDPOINTS.grievance.get(id)),
    updateStatus: (id, data) => api.put(ENDPOINTS.grievance.updateStatus(id), data),
    assign: (id, data) => api.put(ENDPOINTS.grievance.assign(id), data),
    delete: (id) => api.delete(ENDPOINTS.grievance.delete(id)),
    stats: () => api.get(ENDPOINTS.grievance.stats),
    getConversation: (id) => api.get(ENDPOINTS.grievance.conversation(id)),
    sendMessage: (data) => api.post(ENDPOINTS.grievance.sendMessage, data),
  },

  menus: {
    list: (params) => api.get(ENDPOINTS.menus.list, { params }),
    get: (id) => api.get(ENDPOINTS.menus.get(id)),
    create: (data) => api.post(ENDPOINTS.menus.create, data),
    update: (id, data) => api.put(ENDPOINTS.menus.update(id), data),
    delete: (id) => api.delete(ENDPOINTS.menus.delete(id)),
  },

  qr: {
    list: (params) => api.get(ENDPOINTS.qr.list, { params }),
    revoke: (id) => api.delete(ENDPOINTS.qr.revoke(id)),
    forceGrant: (data) => api.post(ENDPOINTS.qr.forceGrant, data),
    accessLogs: (params) => api.get(ENDPOINTS.qr.accessLogs, { params }),
  },

  safeRoute: {
    list: (params) => api.get(ENDPOINTS.safeRoute.list, { params }),
    stats: () => api.get(ENDPOINTS.safeRoute.stats),
    hotspots: (params) => api.get(ENDPOINTS.safeRoute.hotspots, { params }),
  },

  themes: {
    list: (params) => api.get(ENDPOINTS.themes.list, { params }),
    stats: () => api.get(ENDPOINTS.themes.stats),
    getUserPreferences: (params) => api.get(ENDPOINTS.themes.userPreferences, { params }),
    setUserPreference: (data) => api.post(ENDPOINTS.themes.setUserPreference, data),
    get: (id) => api.get(ENDPOINTS.themes.get(id)),
    create: (data) => api.post(ENDPOINTS.themes.create, data),
    update: (id, data) => api.put(ENDPOINTS.themes.update(id), data),
    delete: (id) => api.delete(ENDPOINTS.themes.delete(id)),
    setDefault: (id) => api.put(ENDPOINTS.themes.setDefault(id)),
  },

  childcare: {
    getChildren: (params) => api.get(ENDPOINTS.childcare.children, { params }),
    getChild: (id) => api.get(ENDPOINTS.childcare.child(id)),
    createChild: (data) => api.post(ENDPOINTS.childcare.createChild, data),
    updateChild: (id, data) => api.put(ENDPOINTS.childcare.updateChild(id), data),
    deleteChild: (id) => api.delete(ENDPOINTS.childcare.child(id)),
    getSchedules: (params) => api.get(ENDPOINTS.childcare.schedules, { params }),
    deleteSchedule: (id) => api.delete(ENDPOINTS.childcare.deleteSchedule(id)),
    getAlerts: (params) => api.get(ENDPOINTS.childcare.alerts, { params }),
    getSchoolZones: (params) => api.get(ENDPOINTS.childcare.schoolZones, { params }),
  },

  // Backward compatibility aliases - matches existing slice method names
  login: (credentials) => api.post(ENDPOINTS.auth.login, credentials),
  logout: () => api.post(ENDPOINTS.auth.logout),
  refreshToken: () => api.post(ENDPOINTS.auth.refresh),
  getProfile: () => api.get(ENDPOINTS.auth.profile),
  getUsers: (params) => api.get(ENDPOINTS.users.list, { params }),
  getUserById: (id) => api.get(ENDPOINTS.users.get(id)),
  updateUser: (id, data) => api.put(ENDPOINTS.users.update(id), data),
  deleteUser: (id) => api.delete(ENDPOINTS.users.delete(id)),
  getSOSAlerts: (params) => api.get(ENDPOINTS.sosAlerts.list, { params }),
  getSOSAlertById: (id) => api.get(ENDPOINTS.sosAlerts.get(id)),
  resolveSOSAlert: (id) => api.put(ENDPOINTS.sosAlerts.resolve(id)),
  getActivityLogs: (params) => api.get(ENDPOINTS.activity.logs, { params }),
  getFamilies: (params) => api.get(ENDPOINTS.families.list, { params }),
  getFamilyById: (id) => api.get(ENDPOINTS.families.get(id)),
  createFamily: (data) => api.post(ENDPOINTS.families.create, data),
  updateFamily: (id, data) => api.put(ENDPOINTS.families.update(id), data),
  deleteFamily: (id) => api.delete(ENDPOINTS.families.delete(id)),
  notifyFamily: (id, data) => api.post(ENDPOINTS.families.notify(id), data),
  sendEmergencyContact: (alertId, data) => api.post(ENDPOINTS.sosAlerts.emergencyContact(alertId), data),
  getDevices: (params) => api.get(ENDPOINTS.devices.list, { params }),
  getDeviceById: (id) => api.get(ENDPOINTS.devices.get(id)),
  addDevice: (data) => api.post(ENDPOINTS.devices.create, data),
  updateDevice: (id, data) => api.put(ENDPOINTS.devices.update(id), data),
  toggleDevice: (id) => api.put(ENDPOINTS.devices.toggle(id)),
  deleteDevice: (id) => api.delete(ENDPOINTS.devices.delete(id)),
  getTrackingLocations: (params) => api.get(ENDPOINTS.tracking.locations, { params }),
  getFamilyLocations: (familyId, params) => api.get(ENDPOINTS.tracking.family(familyId), { params }),
  getUserLocation: (userId) => api.get(ENDPOINTS.tracking.user(userId)),
  getUserLocationHistory: (userId, params) => api.get(ENDPOINTS.tracking.userHistory(userId), { params }),
  updateUserLocation: (userId, locationData) => api.post(ENDPOINTS.tracking.updateLocation(userId), locationData),
  getNearbyEmergencyServices: (params) => api.get(ENDPOINTS.tracking.nearby, { params }),
  getGeofences: (params) => api.get(ENDPOINTS.tracking.geofences, { params }),
  createGeofence: (data) => api.post(ENDPOINTS.tracking.geofences, data),
  updateGeofence: (id, data) => api.put(ENDPOINTS.tracking.geofence(id), data),
  deleteGeofence: (id) => api.delete(ENDPOINTS.tracking.geofence(id)),
  getTrackingHeatmap: (params) => api.get(ENDPOINTS.tracking.heatmap, { params }),
  getRoutePrediction: (userId, params) => api.get(ENDPOINTS.tracking.predict(userId), { params }),
  getUserOfflineStatus: (userId) => api.get(ENDPOINTS.tracking.status(userId)),
  sendEmergencyNotification: (alertId, notificationData) => api.post(ENDPOINTS.sosAlerts.notify(alertId), notificationData),
  getTips: (params) => api.get(ENDPOINTS.content.tips, { params }),
  addTip: (data) => api.post(ENDPOINTS.content.addTip, data),
  updateTip: (id, data) => api.put(ENDPOINTS.content.updateTip(id), data),
  deleteTip: (id) => api.delete(ENDPOINTS.content.deleteTip(id)),
  getArticles: (params) => api.get(ENDPOINTS.content.articles, { params }),
  addArticle: (data) => api.post(ENDPOINTS.content.addArticle, data),
  updateArticle: (id, data) => api.put(ENDPOINTS.content.updateArticle(id), data),
  deleteArticle: (id) => api.delete(ENDPOINTS.content.deleteArticle(id)),
  getTutorials: (params) => api.get(ENDPOINTS.content.tutorials, { params }),
  createTutorial: (data) => api.post(ENDPOINTS.content.createTutorial, data),
  updateTutorial: (id, data) => api.put(ENDPOINTS.content.updateTutorial(id), data),
  deleteTutorial: (id) => api.delete(ENDPOINTS.content.deleteTutorial(id)),
  getNews: (params) => api.get(ENDPOINTS.content.news, { params }),
  createNews: (data) => api.post(ENDPOINTS.content.createNews, data),
  updateNews: (id, data) => api.put(ENDPOINTS.content.updateNews(id), data),
  deleteNews: (id) => api.delete(ENDPOINTS.content.deleteNews(id)),
  getLaws: (params) => api.get(ENDPOINTS.content.laws, { params }),
  createLaw: (data) => api.post(ENDPOINTS.content.createLaw, data),
  updateLaw: (id, data) => api.put(ENDPOINTS.content.updateLaw(id), data),
  deleteLaw: (id) => api.delete(ENDPOINTS.content.deleteLaw(id)),
  getHelplines: (params) => api.get(ENDPOINTS.content.helplines, { params }),
  createHelpline: (data) => api.post(ENDPOINTS.content.createHelpline, data),
  updateHelpline: (id, data) => api.put(ENDPOINTS.content.updateHelpline(id), data),
  deleteHelpline: (id) => api.delete(ENDPOINTS.content.deleteHelpline(id)),
  getSettings: () => api.get(ENDPOINTS.settings.get),
  updateSettings: (settings) => api.put(ENDPOINTS.settings.update, settings),
  getStats: () => api.get(ENDPOINTS.analytics.stats),
  getAnalytics: (params) => api.get(ENDPOINTS.analytics.data, { params }),
  getGrievances: (params) => api.get(ENDPOINTS.grievance.list, { params }),
  getGrievanceById: (id) => api.get(ENDPOINTS.grievance.get(id)),
  updateGrievanceStatus: (id, data) => api.put(ENDPOINTS.grievance.updateStatus(id), data),
  assignGrievance: (id, assignedTo) => api.put(ENDPOINTS.grievance.assign(id), { assigned_to: assignedTo }),
  deleteGrievance: (id) => api.delete(ENDPOINTS.grievance.delete(id)),
  getGrievanceStats: () => api.get(ENDPOINTS.grievance.stats),
  getGrievanceConversation: (id) => api.get(ENDPOINTS.grievance.conversation(id)),
  sendGrievanceMessage: (data) => api.post(ENDPOINTS.grievance.sendMessage, data),
  getAllMenus: (params) => api.get(ENDPOINTS.menus.list, { params }),
  getMenuById: (id) => api.get(ENDPOINTS.menus.get(id)),
  createMenu: (data) => api.post(ENDPOINTS.menus.create, data),
  updateMenu: (id, data) => api.put(ENDPOINTS.menus.update(id), data),
  deleteMenu: (id) => api.delete(ENDPOINTS.menus.delete(id)),
  
  // Generic methods for flexible requests
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),
  
  // Tasks (if available)
  getTasks: (params) => api.get(`${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/admin/tasks`, { params }).catch(() => ({ data: { success: false, tasks: [] } })),
};

export { ENDPOINTS, API_CONFIG };
export default api;
