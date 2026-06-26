export interface config {
	site: string;
	title: string;
	description: string;
	author: {
		name: string;
	};
}

export const config: config = {
	site: "https://mendelgreenberg.com",
	title: "Mendel Greenberg",
	description: "Thoughts, Speech, Actions.",
	author: {
		name: "Mendel Greenberg",
	},
};
