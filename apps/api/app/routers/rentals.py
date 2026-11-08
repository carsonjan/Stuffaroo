from datetime import date
from typing import Annotated, Literal, Self
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field, model_validator

from app.core.auth import CurrentProfile
from app.core.db import get_conn
from app.models.schemas import CamelModel, RentalRequest
from app.services import rentals

router = APIRouter(prefix="/api/rentals", tags=["rentals"])

Conn = Annotated[psycopg.Connection, Depends(get_conn)]


class RentalCreate(CamelModel):
    listing_id: UUID
    start_date: date
    end_date: date
    message: str = Field(default="", max_length=1000)

    @model_validator(mode="after")
    def check_dates(self) -> Self:
        if self.end_date < self.start_date:
            raise ValueError("endDate must be on or after startDate")
        return self


class TransitionBody(CamelModel):
    action: rentals.Action


def _http(error: rentals.RentalError) -> HTTPException:
    return HTTPException(error.status, error.detail)


@router.post("", response_model=RentalRequest, status_code=201)
def request_rental(body: RentalCreate, me: CurrentProfile, conn: Conn) -> RentalRequest:
    try:
        return rentals.create_rental(
            conn,
            borrower_id=me.id,
            listing_id=body.listing_id,
            start_date=body.start_date,
            end_date=body.end_date,
            message=body.message.strip(),
        )
    except rentals.RentalError as error:
        raise _http(error) from error


@router.get("", response_model=list[RentalRequest])
def list_rentals(
    role: Literal["owner", "borrower"], me: CurrentProfile, conn: Conn
) -> list[RentalRequest]:
    return rentals.list_rentals(conn, me.id, role)


@router.get("/{rental_id}", response_model=RentalRequest)
def read_rental(rental_id: UUID, me: CurrentProfile, conn: Conn) -> RentalRequest:
    rental = rentals.get_rental(conn, rental_id)
    # Only the two parties can see a request; to anyone else it doesn't exist.
    if rental is None or me.id not in (rental.borrower_id, rental.listing.owner_id):
        raise HTTPException(404, "Rental request not found")
    return rental


@router.post("/{rental_id}/transition", response_model=RentalRequest)
def change_status(
    rental_id: UUID, body: TransitionBody, me: CurrentProfile, conn: Conn
) -> RentalRequest:
    try:
        return rentals.transition(conn, rental_id, me.id, body.action)
    except rentals.RentalError as error:
        raise _http(error) from error
