import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HelloService } from './hello.service';
import { Hello } from '../shared/transfer/hello.dto';

@Controller()
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @GrpcMethod('HelloService', 'getHello')
  getHello(): Hello {
    return { message: this.helloService.getHello() };
  }
}
