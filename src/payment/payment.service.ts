import { Injectable, Inject } from '@nestjs/common';
import { Payment } from './entities/payment-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from 'src/users/entities/users.module.entity';
import { CreatePaymentInput } from './dto/create-payment.dto';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { GetPaymentOutput } from './dto/get-payment.dto';
import { Cron, SchedulerRegistry, Interval } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>, //  private readonly SchedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaId }: CreatePaymentInput,
  ): Promise<CreateAccountOutput> {
    try {
      const resta = await this.restaurants.findOne(restaId);
      if (!resta) {
        return {
          ok: false,
          error: 'restaurant not found',
        };
      }
      if (resta.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'not your resta',
        };
      }
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant: resta,
        }),
      );
      resta.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      resta.promotedUntil = date;
      this.restaurants.save(resta);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentOutput> {
    try {
      const paymentsArr = await this.payments.find({
        user: owner,
      });
      if (!paymentsArr) {
        return {
          ok: false,
          error: "owner doesn't have payments",
        };
      }

      return {
        ok: true,
        payments: paymentsArr,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants() {
    const resta = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    console.log(resta);

    resta.forEach(async (rest) => {
      (rest.isPromoted = false), (rest.promotedUntil = null);
      await this.restaurants.save(rest);
    });
  }
  // @Cron('30 * * * * *', { name: 'myJob' })
  // checkForPayments() {
  //   console.log('YEP Check Payments');
  //   const job = this.SchedulerRegistry.getCronJob('myJob');
  //   job.stop();
  // }
}
