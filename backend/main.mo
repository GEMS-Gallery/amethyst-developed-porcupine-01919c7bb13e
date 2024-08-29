import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

actor {
  // Types
  type Person = {
    id: Nat;
    name: Text;
    percentage: Float;
  };

  // Stable variables
  stable var people : [Person] = [];
  stable var billTotal : Float = 0;

  // Mutable variables
  var nextId : Nat = 0;

  // Helper function to calculate total percentage
  func calculateTotalPercentage() : Float {
    Array.foldLeft<Person, Float>(people, 0, func(acc, person) { acc + person.percentage })
  };

  // Add a new person
  public func addPerson(name : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newPerson : Person = {
      id = id;
      name = name;
      percentage = 0;
    };
    people := Array.append(people, [newPerson]);
    id
  };

  // Remove a person
  public func removePerson(id : Nat) : async Bool {
    let newPeople = Array.filter(people, func(p : Person) : Bool { p.id != id });
    let removed = Array.size(people) != Array.size(newPeople);
    if (removed) {
      people := newPeople;
    };
    removed
  };

  // Update person's percentage
  public func updatePercentage(id : Nat, newPercentage : Float) : async Bool {
    let index = Array.indexOf<Person>({ id = id; name = ""; percentage = 0 }, people, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let updatedPerson = { id = id; name = people[i].name; percentage = newPercentage };
        people := Array.tabulate<Person>(Array.size(people), func(j) {
          if (j == i) { updatedPerson } else { people[j] }
        });
        true
      };
    }
  };

  // Set bill total
  public func setBillTotal(total : Float) : async () {
    billTotal := total;
  };

  // Get current bill split information
  public query func getBillSplit() : async ?{
    total: Float;
    people: [{ name: Text; amount: Float }];
    isValid: Bool;
  } {
    let totalPercentage = calculateTotalPercentage();
    let isValid = Float.abs(totalPercentage - 100.0) < 0.01;

    ?{
      total = billTotal;
      people = Array.map<Person, { name: Text; amount: Float }>(people, func(p) {
        { name = p.name; amount = (p.percentage / 100.0) * billTotal }
      });
      isValid = isValid;
    }
  };
}
