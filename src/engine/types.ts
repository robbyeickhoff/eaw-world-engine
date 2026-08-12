export interface Point3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface BuildBounds {
  readonly min: Point3;
  readonly max: Point3;
}

export interface BuildDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly bounds: BuildBounds;
}
