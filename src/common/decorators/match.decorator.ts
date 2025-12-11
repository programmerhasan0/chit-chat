import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
class MatchConstraint implements ValidatorConstraintInterface {
  //validating the 2 inputs
  validate(value: unknown, args: ValidationArguments): boolean {
    //getting the property name and value to validate.
    const [relatedPropertyName] = args.constraints as string[];
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    return value === relatedValue;
  }
  defaultMessage(args?: ValidationArguments): string {
    return `${args?.property} must match ${args?.constraints[0]}`;
  }
}

export function Match(
  property: string,
  options: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}
