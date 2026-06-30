"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  addCustomer,
  editCustomer,
  toggleCustomerStatus,
  deleteCustomer,
  assignTrainer,
  renewSubscription
} from "@/actions/customer";
import { createSession } from "@/actions/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Dialog, ConfirmationDialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

interface InvoiceLog {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  createdAt: string;
  activePlan: {
    id: string;
    title: string;
    expiryDate: string;
    status: string;
  } | null;
  assignedTrainer: {
    id: string;
    name: string;
  } | null;
  invoices: InvoiceLog[];
}

interface TrainerSelect {
  id: string;
  name: string;
}

interface PlanSelect {
  id: string;
  title: string;
  price: number;
  duration: string;
}

interface CustomerDirectoryClientProps {
  customers: Customer[];
  trainers: TrainerSelect[];
  plans: PlanSelect[];
}

export default function CustomerDirectoryClient({
  customers,
  trainers,
  plans
}: CustomerDirectoryClientProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Selected customer for actions
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");
  const [sessionProvider, setSessionProvider] = useState<"GoogleMeet" | "Zoom" | "Manual">("GoogleMeet");

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Key KPI stats
  const totalCustomers = customers.length;
  const activeSubs = customers.filter(c => c.activePlan && c.activePlan.status === "ACTIVE").length;
  const suspendedCount = customers.filter(c => c.status === "SUSPENDED").length;

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  // Open Handlers
  const handleOpenAdd = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setCountry("India");
    setTimezone("Asia/Kolkata");
    setFormError("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setSelectedCust(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone === "N/A" ? "" : c.phone);
    setCountry(c.country === "N/A" ? "India" : c.country);
    setTimezone(c.timezone);
    setFormError("");
    setIsEditOpen(true);
  };

  const handleOpenSchedule = (c: Customer) => {
    setSelectedCust(c);
    setSelectedTrainerId(c.assignedTrainer?.id || "");
    setSessionTitle("");
    setSessionDate("");
    setSessionStartTime("");
    setSessionEndTime("");
    setSessionProvider("GoogleMeet");
    setFormError("");
    setIsScheduleOpen(true);
  };

  const handleOpenAssign = (c: Customer) => {
    setSelectedCust(c);
    setSelectedTrainerId(c.assignedTrainer?.id || "");
    setFormError("");
    setIsAssignOpen(true);
  };

  const handleOpenRenew = (c: Customer) => {
    setSelectedCust(c);
    setSelectedPlanId("");
    setFormError("");
    setIsRenewOpen(true);
  };

  const handleOpenInvoices = (c: Customer) => {
    setSelectedCust(c);
    setIsInvoicesOpen(true);
  };

  const handleOpenDelete = (c: Customer) => {
    setSelectedCust(c);
    setIsDeleteOpen(true);
  };

  // Submit handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const res = await addCustomer({
      name,
      email,
      password,
      phone: phone || undefined,
      country: country || undefined,
      timezone
    });

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to create customer.");
    } else {
      setIsAddOpen(false);
      router.refresh();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!selectedCust) return;

    const res = await editCustomer({
      id: selectedCust.id,
      name,
      email,
      phone: phone || undefined,
      country: country || undefined,
      timezone
    });

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to update customer.");
    } else {
      setIsEditOpen(false);
      router.refresh();
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!selectedCust || !selectedTrainerId) return;

    const res = await assignTrainer(selectedCust.id, selectedTrainerId);

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to assign trainer.");
    } else {
      setIsAssignOpen(false);
      router.refresh();
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!selectedCust || !selectedTrainerId) {
      setFormError("Assign a trainer to this customer first before scheduling classes.");
      setLoading(false);
      return;
    }

    // Combine date and times to ISO strings
    const startDateTime = new Date(`${sessionDate}T${sessionStartTime}:00Z`);
    const endDateTime = new Date(`${sessionDate}T${sessionEndTime}:00Z`);
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const duration = Math.round(diffMs / (60 * 1000));

    if (duration <= 0) {
      setFormError("End time must be after start time.");
      setLoading(false);
      return;
    }

    const res = await createSession({
      customerId: selectedCust.id,
      trainerId: selectedTrainerId,
      title: sessionTitle,
      date: sessionDate,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration,
      meetingProvider: sessionProvider
    });

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to schedule class.");
    } else {
      setIsScheduleOpen(false);
      router.refresh();
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!selectedCust || !selectedPlanId) return;

    const res = await renewSubscription(selectedCust.id, selectedPlanId);

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to renew subscription.");
    } else {
      setIsRenewOpen(false);
      router.refresh();
    }
  };

  const handleStatusToggle = async (c: Customer) => {
    setLoading(true);
    const res = await toggleCustomerStatus(c.id, c.status);
    setLoading(false);
    if (res.success) {
      router.refresh();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCust) return;
    setLoading(true);
    const res = await deleteCustomer(selectedCust.id);
    setLoading(false);
    if (res.success) {
      setIsDeleteOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Customer Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-teal">Customers Directory</h1>
          <p className="text-sm text-text-muted mt-1">Manage platform clients, assign instructors, and update practice logs.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full bg-deep-teal text-white hover:bg-deep-teal/90 text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border border-cream-dark shadow-xs">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Total Customers</p>
            <h3 className="text-3xl font-black text-deep-teal mt-2">{totalCustomers}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border border-cream-dark shadow-xs">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Active Subscriptions</p>
            <h3 className="text-3xl font-black text-green-700 mt-2">{activeSubs}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border border-cream-dark shadow-xs">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Suspended Clients</p>
            <h3 className="text-3xl font-black text-red-600 mt-2">{suspendedCount}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Directory Table Grid */}
      <Card className="bg-white border border-cream-dark shadow-xs overflow-hidden">
        <div className="p-5 border-b border-cream-dark/50 bg-warm-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-base font-bold text-text-dark shrink-0">Client Registry</CardTitle>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </span>
            <input 
              type="text"
              placeholder="Search by name, email, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-cream-dark rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-deep-teal text-text-dark placeholder:text-text-muted/65 transition-colors"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-12">No matching customers found.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-warm-cream/5">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location & Phone</TableHead>
                    <TableHead>Active Subscription</TableHead>
                    <TableHead>Assigned Trainer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => (
                    <TableRow key={c.id} className="hover:bg-warm-cream/10 transition-colors">
                      <TableCell className="py-4">
                        <div className="font-semibold text-text-dark text-sm">{c.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{c.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-text-dark">{c.country}</div>
                        <div className="text-xs text-text-muted mt-0.5">{c.phone}</div>
                      </TableCell>
                      <TableCell>
                        {c.activePlan ? (
                          <div>
                            <div className="font-bold text-xs text-deep-teal">{c.activePlan.title}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                              Expires: {new Date(c.activePlan.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-text-muted">No Plan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.assignedTrainer ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-deep-teal shrink-0" />
                            <span className="text-sm text-text-dark">{c.assignedTrainer.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-text-muted">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "ACTIVE" ? "success" : "destructive"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={() => handleOpenSchedule(c)}
                            title="Schedule Session"
                            className="p-2 text-deep-teal hover:bg-deep-teal/10 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenRenew(c)}
                            title="Renew Subscription"
                            className="p-2 text-deep-teal hover:bg-deep-teal/10 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenAssign(c)}
                            title="Assign Trainer"
                            className="p-2 text-logo-gold hover:bg-logo-gold/10 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenInvoices(c)}
                            title="View Invoices"
                            className="p-2 text-text-muted hover:bg-cream-dark/50 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h19.5m-19.5 0h19.5M4 18.75h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Details"
                            className="p-2 text-text-dark hover:bg-cream-dark/50 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleStatusToggle(c)}
                            title={c.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                            className={`p-2 rounded-full transition-colors ${
                              c.status === "ACTIVE" ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(c)}
                            title="Delete Account"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG 1: Add Customer Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Customer Account">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Full Name</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emily Watson"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. emily@domain.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Initial Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Phone Number</label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Country</label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Timezone</label>
              <Input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 2: Edit Customer Modal */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Full Name</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Phone Number</label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Country</label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Timezone</label>
              <Input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 3: Assign Personal Trainer */}
      <Dialog isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Yoga Trainer">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <p className="text-sm text-text-muted">
            Select an active instructor to assign to customer <strong className="text-text-dark">{selectedCust?.name}</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Available Trainers</label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
              className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
            >
              <option value="" className="text-text-muted">-- Select Instructor --</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id} className="text-text-dark">{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Trainer"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 4: Renew / Activate Plan */}
      <Dialog isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} title="Renew Subscription Package">
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <p className="text-sm text-text-muted">
            Choose a subscription plan to activate for customer <strong className="text-text-dark">{selectedCust?.name}</strong>. This generates a manual paid invoice automatically.
          </p>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Standard Plans</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
              className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
            >
              <option value="" className="text-text-muted">-- Select Package Plan --</option>
              {plans.map(p => (
                <option key={p.id} value={p.id} className="text-text-dark">{p.title} (${p.price.toFixed(2)} - {p.duration})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => setIsRenewOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Activating..." : "Activate & Invoice"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 5: Invoices List Modal */}
      <Dialog isOpen={isInvoicesOpen} onClose={() => setIsInvoicesOpen(false)} title={`${selectedCust?.name}'s Invoices`}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {selectedCust?.invoices.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No invoices found for this customer.</p>
          ) : (
            <div className="space-y-3">
              {selectedCust?.invoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-warm-cream/20 border border-cream-dark/50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-text-dark">{inv.invoiceNumber}</h4>
                    <span className="text-[10px] text-text-muted">Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-deep-teal block">${inv.amount.toFixed(2)}</span>
                    <Badge variant="success" className="mt-0.5">paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setIsInvoicesOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 6: Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete the account for ${selectedCust?.name}? All their subscription packages, invoices, progress logs, and calendars will be deleted. This action cannot be undone.`}
        confirmText="Permanently Delete"
        isDestructive={true}
        isLoading={loading}
      />

      {/* DIALOG 7: Schedule Practice Session Modal */}
      <Dialog isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Practice Session">
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Session Title</label>
            <Input
              type="text"
              required
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Morning Flow Vinyasa"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Instructor</label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
              className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
            >
              <option value="">-- Select Instructor --</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Meeting Provider</label>
            <select
              value={sessionProvider}
              onChange={(e) => setSessionProvider(e.target.value as any)}
              required
              className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
            >
              <option value="GoogleMeet">Google Meet</option>
              <option value="Zoom">Zoom</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Session Date</label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Start Time (UTC)</label>
              <input
                type="time"
                required
                value={sessionStartTime}
                onChange={(e) => setSessionStartTime(e.target.value)}
                className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">End Time (UTC)</label>
              <input
                type="time"
                required
                value={sessionEndTime}
                onChange={(e) => setSessionEndTime(e.target.value)}
                className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors text-text-dark"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
