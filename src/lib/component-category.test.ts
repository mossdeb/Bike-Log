import { describe, it, expect } from "vitest";
import { compareByCategory } from "./component-category";

const component = (id: string, category: string | null) => ({ id, category });

const order = (list: ReturnType<typeof component>[]) =>
  [...list].sort(compareByCategory).map((c) => c.id);

describe("compareByCategory", () => {
  it("puts categories in the order COMPONENT_CATEGORIES declares, not alphabetical", () => {
    // Alphabetically this would be brakes, fork, tire, transmission, wheels.
    expect(
      order([
        component("tire", "Tire"),
        component("fork", "Front Suspension (Fork)"),
        component("wheels", "Wheels"),
        component("transmission", "Transmission"),
        component("brakes", "Brakes"),
      ])
    ).toEqual(["fork", "transmission", "brakes", "wheels", "tire"]);
  });

  it("keeps the incoming order inside a category", () => {
    // The bike page arrives sorted by created_at and relies on this to keep
    // two tyres in the order they were fitted.
    expect(
      order([
        component("rear-tire", "Tire"),
        component("front-tire", "Tire"),
        component("fork", "Front Suspension (Fork)"),
      ])
    ).toEqual(["fork", "rear-tire", "front-tire"]);
  });

  it("sorts a category the list no longer has to the end", () => {
    // Rows written before the category list changed still render; they must
    // not be given rank -1 and jump ahead of everything.
    expect(
      order([
        component("legacy", "Dropper Post"),
        component("tire", "Tire"),
        component("fork", "Front Suspension (Fork)"),
      ])
    ).toEqual(["fork", "tire", "legacy"]);
  });

  it("sorts a component with no category to the end", () => {
    expect(
      order([component("none", null), component("fork", "Front Suspension (Fork)")])
    ).toEqual(["fork", "none"]);
  });
});
