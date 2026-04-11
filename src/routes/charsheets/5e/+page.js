// on page load, place route param slug (id) into props
export const load = ({ url }) => {
	const id = url.searchParams.get('id');
	return {
		id: typeof id === 'string' ? id.trim() : null
	};
};
