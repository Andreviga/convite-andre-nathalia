/** Cookie que lembra, neste aparelho, o convite criado ao responder pelo link geral do evento. */
export function rsvpCookie(slug: string): string {
  return `convidei_rsvp_${slug}`;
}

/** Quantas pessoas alguém pode informar ao responder pelo link geral. */
export const OPEN_MAX_PEOPLE = 6;
