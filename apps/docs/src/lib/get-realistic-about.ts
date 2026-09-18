"use server";

import { api } from "./rpc";


export async function getRealisticAbout() {
    'use cache';
	const response = await api["about-message-contents"].$get();
	const json = await response.json()

	return json;

}