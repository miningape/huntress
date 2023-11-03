select
	listing.id as listing_id,
	listing.address as address,
	listing.size as size,
	listing.type as rental_type,
	listing.rooms as rooms,
	listing.floor as floor,
	listing.furnished as furnished,
	listing."petsAllowed" as pets_allowed,
	listing.balcony as balcony,
	listing."washingMachine" as washing_machine,
	listing.dishwasher as dishwasher,
	listing.elevator as elevator,
	listing."monthlyRent" as monthly_rent,
	listing."Aconto" as a_conto,
	listing.deposit as deposit,
	listing."prepaidRent" as prepaid_rent,
	listing."moveInPrice" as move_in_price,
	listing."availableFrom" as available_from,
	listing."rentalPeriod" as rental_period,
	bp_listing.case_number as case_number,
	bp_listing.url as url
 from "Listing" as listing
	JOIN "BoligPortalListing" as bp_listing on listing."bolig_portal_listing_id" = bp_listing."id"
 	JOIN (
 		select 
            id as execution_id 
        from "Execution" 
        where 
            status = 'Finished' and 
            "job_id" = 'a0769fce-a80c-42ee-864c-17e68190baee' 
        order by started_at 
        desc limit 1
 ) latest_execution on bp_listing."last_seen_on_execution_id" = latest_execution.execution_id