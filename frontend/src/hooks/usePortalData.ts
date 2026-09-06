"use client";
import { useState, useEffect } from "react";
import { portalStore } from "@/lib/portalService";
import {
  ClientPortalProfile,
  ClientInvoice,
  ClientProject,
  ClientWorkRequest,
  ClientSeoRecord,
  PortalSupportTicket,
} from "@/types/portal";

export function usePortalData(clientId?: string) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsub = portalStore.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  const activeClientId = clientId || portalStore.getActiveClientId();
  const client = portalStore.getClientById(activeClientId) || portalStore.getActiveClient();
  const clients = portalStore.getClients();
  const invoices = portalStore.getInvoices(activeClientId);
  const allInvoices = portalStore.getInvoices();
  const dues = portalStore.getClientDues(activeClientId);
  const projects = portalStore.getProjects(activeClientId);
  const allProjects = portalStore.getProjects();
  const workRequests = portalStore.getWorkRequests(activeClientId);
  const allWorkRequests = portalStore.getWorkRequests();
  const seoData = portalStore.getSeoData(activeClientId);
  const tickets = portalStore.getTickets(activeClientId);
  const allTickets = portalStore.getTickets();

  const isAuthenticated = portalStore.isClientAuthenticated();

  return {
    version,
    activeClientId,
    client,
    clients,
    isAuthenticated,
    clientLogin: portalStore.clientLogin.bind(portalStore),
    clientLogout: portalStore.clientLogout.bind(portalStore),
    setAdminPreviewClient: portalStore.setAdminPreviewClient.bind(portalStore),
    invoices,
    allInvoices,
    dues,
    projects,
    allProjects,
    workRequests,
    allWorkRequests,
    seoData,
    tickets,
    allTickets,
    setActiveClient: (id: string) => portalStore.setActiveClientId(id),
    createInvoice: portalStore.createInvoice.bind(portalStore),
    updateInvoice: portalStore.updateInvoice.bind(portalStore),
    deleteInvoice: portalStore.deleteInvoice.bind(portalStore),
    recordPayment: portalStore.recordPayment.bind(portalStore),
    updateProjectProgress: portalStore.updateProjectProgress.bind(portalStore),
    toggleMilestone: portalStore.toggleMilestone.bind(portalStore),
    createWorkRequest: portalStore.createWorkRequest.bind(portalStore),
    updateWorkRequestStatus: portalStore.updateWorkRequestStatus.bind(portalStore),
    updateDailySeoStats: portalStore.updateDailySeoStats.bind(portalStore),
    addDailySeoActivity: portalStore.addDailySeoActivity.bind(portalStore),
    addTrackedKeyword: portalStore.addTrackedKeyword.bind(portalStore),
    updateKeywordRank: portalStore.updateKeywordRank.bind(portalStore),
    createTicket: portalStore.createTicket.bind(portalStore),
    addTicketReply: portalStore.addTicketReply.bind(portalStore),
    addClient: portalStore.addClient.bind(portalStore),
    deleteClient: portalStore.deleteClient.bind(portalStore),
    clearAllDemoData: portalStore.clearAllDemoData.bind(portalStore),
    updateTicketStatus: portalStore.updateTicketStatus.bind(portalStore),
  };
}

