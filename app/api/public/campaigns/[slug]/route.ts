import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const campaignsCollection = collection(db, "campaigns");

async function fetchCampaignBySlug(slugParam: string) {
  const normalizedSlug = slugParam.trim().toLowerCase();
  const snapshot = await getDocs(query(campaignsCollection, where("slug", "==", normalizedSlug), limit(1)));
  if (!snapshot.empty) {
    const first = snapshot.docs[0];
    return { id: first.id, data: first.data() };
  }

  // Fallback: allow direct document id access for legacy links
  const docRef = doc(db, "campaigns", slugParam);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, data: docSnap.data() };
  }

  return null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const campaign = await fetchCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: campaign.id,
    slug: campaign.data.slug ?? slug.trim().toLowerCase(),
    name: campaign.data.name,
    description: campaign.data.description ?? null,
    eventId: campaign.data.eventId,
    eventName: campaign.data.eventName,
    eventDate: campaign.data.eventDate ?? null,
    eventTime: campaign.data.eventTime ?? null,
    eventPlace: campaign.data.eventPlace ?? null,
    eventLogo: campaign.data.eventLogo ?? null,
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const campaign = await fetchCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  const eventRef = doc(db, "events", campaign.data.eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const event = eventSnap.data();
  if (!event.publicInvitesEnabled) {
    return NextResponse.json({ error: "Les invitations publiques sont désactivées" }, { status: 403 });
  }

  const { nom, prenom, email, phone } = await req.json();

  if (!nom || !prenom) {
    return NextResponse.json({ error: "Nom et prénom sont requis" }, { status: 400 });
  }

  const invitePayload = {
    nom,
    prenom,
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    eventId: campaign.data.eventId,
    eventName: event.name || campaign.data.eventName || null,
    eventDate: event.date || campaign.data.eventDate || null,
    eventTime: event.time || campaign.data.eventTime || null,
    eventPlace: event.place || campaign.data.eventPlace || null,
    eventLogo: event.logoUrl || campaign.data.eventLogo || null,
    status: "INVITED",
    createdAt: Date.now(),
    createdBy: event.createdBy,
    createdByEmail: event.createdByEmail ?? null,
    campaignId: campaign.id,
    campaignSlug: slug,
    campaignName: campaign.data.name,
    source: "campaign",
  };

  const inviteDoc = await addDoc(collection(db, "invites"), invitePayload);
  return NextResponse.json({ success: true, id: inviteDoc.id });
}
