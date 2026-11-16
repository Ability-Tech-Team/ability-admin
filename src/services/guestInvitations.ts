export type GuestInvitationStats = {
  activeQrPasses: number;
  scheduledVisits: number;
  scannedEntries: number;
  outsideGeofence: number;
};

export type GuestInvitation = {
  id: string;
  invitationId: string;
  guestName: string;
  guestPhone: string;
  invitedByName: string;
  invitedByLocation: string;
  resident: string;
  unit: string;
  project: string;
  visitDate: string;
  createdAt: string;
  qrStatus: "active" | "scheduled" | "expired" | "revoked";
  locationRule: "inside-zone" | "outside-zone";
  scans: number;
};

// TODO: replace with real API call
export async function fetchGuestInvitationStats(): Promise<GuestInvitationStats> {
  return { activeQrPasses: 1, scheduledVisits: 1, scannedEntries: 1, outsideGeofence: 2 };
}

// TODO: replace with real API call
export async function fetchGuestInvitations(): Promise<GuestInvitation[]> {
  return [
    { id: "1", invitationId: "GI-10428", guestName: "Sara Magdy", guestPhone: "+20 100 402 1188", invitedByName: "Passant Shaaban", invitedByLocation: "Gouna · Villa 402", resident: "Passant Shaaban", unit: "Villa 402", project: "Gouna", visitDate: "2026-10-08", createdAt: "Today, 07:50", qrStatus: "active", locationRule: "inside-zone", scans: 0 },
    { id: "2", invitationId: "GI-10427", guestName: "Mohamed Emad", guestPhone: "+20 101 890 4421", invitedByName: "Ahmed Al Rashidi", invitedByLocation: "Marina Heights · 301", resident: "Ahmed Al Rashidi", unit: "301", project: "Marina Heights", visitDate: "2026-10-08", createdAt: "Today, 08:15", qrStatus: "scheduled", locationRule: "outside-zone", scans: 0 },
    { id: "3", invitationId: "GI-10426", guestName: "Nour Hassan", guestPhone: "+20 122 340 9981", invitedByName: "Fatima Al Suwaidi", invitedByLocation: "Marina Heights · 502", resident: "Fatima Al Suwaidi", unit: "502", project: "Marina Heights", visitDate: "2026-10-06", createdAt: "2026-10-05, 14:30", qrStatus: "expired", locationRule: "inside-zone", scans: 1 },
    { id: "4", invitationId: "GI-10425", guestName: "Omar Fathy", guestPhone: "+20 111 980 2234", invitedByName: "James Mitchell", invitedByLocation: "Palm Residences · Villa 12", resident: "James Mitchell", unit: "Villa 12", project: "Palm Residences", visitDate: "2026-10-05", createdAt: "2026-10-04, 16:00", qrStatus: "revoked", locationRule: "outside-zone", scans: 0 },
  ];
}
