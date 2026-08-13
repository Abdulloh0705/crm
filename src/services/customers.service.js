import { httpClient } from '../api/httpClient'
import { CUSTOMERS, BUSINESSES, LEADS, DEALS, PAYMENTS, INSTALLATIONS, ACTIVITIES, TASKS } from '../api/endpoints'

export const customersService = {
  list: (params) => httpClient.get(CUSTOMERS.LIST, { params }),
  get: (id) => httpClient.get(CUSTOMERS.DETAIL(id)),
  create: (payload) => httpClient.post(CUSTOMERS.CREATE, payload),
  update: (id, payload) => httpClient.patch(CUSTOMERS.UPDATE(id), payload),
  deactivate: (id) => httpClient.post(CUSTOMERS.DEACTIVATE(id)),

  // Related records — plain list() calls filtered by customerId, not
  // separate nested endpoints, to keep the backend surface small.
  getBusinesses: (id) => httpClient.get(BUSINESSES.LIST, { params: { customerId: id } }),
  getLeads: (id) => httpClient.get(LEADS.LIST, { params: { customerId: id } }),
  getDeals: (id) => httpClient.get(DEALS.LIST, { params: { customerId: id } }),
  getPayments: (id) => httpClient.get(PAYMENTS.LIST, { params: { customerId: id } }),
  getInstallations: (id) => httpClient.get(INSTALLATIONS.LIST, { params: { customerId: id } }),
  getActivities: (id) => httpClient.get(ACTIVITIES.LIST, { params: { customerId: id } }),
  getTasks: (id) => httpClient.get(TASKS.LIST, { params: { customerId: id } }),
}
