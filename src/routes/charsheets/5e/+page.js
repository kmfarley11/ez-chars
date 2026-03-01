// on page load, place route param slug (id) into props
export const load = ({ url }) => {
	return {
		id: url.searchParams.get('id') ?? '0'
	};
};
