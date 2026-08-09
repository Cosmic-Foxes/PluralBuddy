import type z from "zod";
import { PAlter } from "@/pluralbuddy/alter";
import type { ImportNotation } from "@/pluralbuddy/import-notation";
import type { PSystem } from "@/pluralbuddy/system";
import { PTag } from "@/pluralbuddy/tag";

export type ConverterInput = {
	import: unknown;
	system: unknown;
	alter: unknown;
	tag: unknown;
};

export default interface Converter<V extends ConverterInput> {
	to(system: V["system"]): PSystem | null;
	toImport(data: V["import"]): z.infer<typeof ImportNotation>;
	toAlter(alter: V["alter"]): PAlter;
	toTag(tag: V["tag"]): PTag;

	from(system: PSystem): V["system"];
	fromImport(data: z.infer<typeof ImportNotation>): V["import"];
	fromAlter(data: PAlter): V["alter"];
	fromTag(data: PTag): V["tag"];
}
