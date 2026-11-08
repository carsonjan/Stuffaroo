"use server";

import { revalidatePath } from "next/cache";

import {
  ApiError,
  createRental,
  describeApiError,
  transitionRental,
} from "@/lib/api";
import type { RentalAction, RentalRequest } from "@/lib/api-types";

export type RequestRentalState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent"; request: RentalRequest };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** Sends a borrow/rent request for a listing as the signed-in user. */
export async function requestRentalAction(
  _previous: RequestRentalState,
  formData: FormData,
): Promise<RequestRentalState> {
  const error = (message: string): RequestRentalState => ({
    status: "error",
    message,
  });

  const listingId = field(formData, "listingId");
  if (!listingId) return error("This listing couldn't be found.");
  const startDate = field(formData, "startDate");
  const endDate = field(formData, "endDate");
  if (!isoDate.test(startDate) || !isoDate.test(endDate)) {
    return error("Pick both dates.");
  }
  if (endDate < startDate) {
    return error("The end date is before the start date.");
  }
  const message = field(formData, "message");
  if (message.length > 1000) {
    return error("Keep the message under 1,000 characters.");
  }

  try {
    const request = await createRental({
      listingId,
      startDate,
      endDate,
      message,
    });
    revalidatePath("/marketplace/dashboard", "layout");
    return { status: "sent", request };
  } catch (caught) {
    if (caught instanceof ApiError) return error(describeApiError(caught));
    throw caught;
  }
}

export type TransitionResult = { ok: true } | { ok: false; message: string };

const actions: RentalAction[] = [
  "accept",
  "reject",
  "cancel",
  "start",
  "complete",
];

/**
 * Moves a request through its lifecycle. The API decides whether the signed-in
 * user may do this (owner vs borrower, current status, date overlaps).
 */
export async function transitionRentalAction(
  requestId: string,
  action: RentalAction,
): Promise<TransitionResult> {
  if (!requestId || !actions.includes(action)) {
    return { ok: false, message: "That action isn't available." };
  }
  try {
    await transitionRental(requestId, action);
  } catch (caught) {
    if (caught instanceof ApiError) {
      return { ok: false, message: describeApiError(caught) };
    }
    throw caught;
  }
  revalidatePath("/marketplace/dashboard", "layout");
  return { ok: true };
}
