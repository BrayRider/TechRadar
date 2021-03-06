export class Cycle {
    id: string;
    name: string;
    fullName: string;
    description: string;
    order: number;
    size: number;

    constructor(cycleInfo: any) {
        this.id = cycleInfo.id;
        this.name = cycleInfo.name;
        this.fullName = cycleInfo.fullName;
        this.description = cycleInfo.description;
        this.order = cycleInfo.order;
        this.size = cycleInfo.size;
    }
}
