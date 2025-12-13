import { PrismaClientKnownRequestError } from './../../generated/prisma/internal/prismaNamespace';
import {
    ExceptionFilter,
    Catch,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError) {
        if (exception.code === 'P2002') {
            console.log(exception.meta?.target);
            const target = exception.meta?.target as
                | string
                | string[]
                | undefined;

            const targetStr = Array.isArray(target)
                ? target.join(', ')
                : typeof target === 'string'
                  ? target
                  : 'field';
            throw new ConflictException(`${targetStr} already exists.`);
        }

        throw new InternalServerErrorException();
    }
}
