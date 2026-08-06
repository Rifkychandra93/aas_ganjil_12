export const generateTicketCode = () => {

    const random =
    Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();

    return `TIX-${Date.now()}-${random}`;

}