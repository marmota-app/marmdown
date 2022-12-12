import { ContainerBlock } from "./element/Element";

export interface Parsers {
	parseCompleteText(text: string): ContainerBlock[],
}

export class MarmdownParsers implements Parsers {
	parseCompleteText(text: string): ContainerBlock[] {
		return []
	}
}