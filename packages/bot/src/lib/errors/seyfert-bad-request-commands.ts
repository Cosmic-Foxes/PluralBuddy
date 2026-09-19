import commands from "../../../commands.json";

const pattern = /PUT \/applications\/:id\/commands\n(.*) \[(.*)]: (.*)./

export function decodeDetail(detail: string) {
    const patternTested = pattern.exec(detail) ?? [];
    const commandNumber = Number(patternTested[1]?.split(".")[0])

    return { jsonRef: patternTested[1], errorType: patternTested[2], reason: patternTested[3], command: commands[commandNumber] };
}