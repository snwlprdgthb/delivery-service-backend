import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Payment } from './entities/payment-entity';
import { PaymentsService } from './payment.service';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/users.module.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dto/create-payment.dto';
import { roleDec } from 'src/auth/role-decorator';
import { GetPaymentOutput } from './dto/get-payment.dto';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly PaymentsService: PaymentsService) {}

  @Mutation(() => CreateAccountOutput)
  @roleDec(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') CreatePaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.PaymentsService.createPayment(owner, CreatePaymentInput);
  }

  @Query(() => GetPaymentOutput)
  @roleDec(['Owner'])
  getPayments(@AuthUser() owner: User): Promise<GetPaymentOutput> {
    return this.PaymentsService.getPayments(owner);
  }
}
