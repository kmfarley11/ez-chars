// on page load, place route param slug (id) into props
export const load = ({ params }) => {
    return {
        id: params.id
    }
}