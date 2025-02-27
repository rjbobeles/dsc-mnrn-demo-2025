import { Test, TestingModule } from '@nestjs/testing';
import { Gpt4allService } from './gpt4all.service';

describe('Gpt4allService', () => {
  let service: Gpt4allService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Gpt4allService],
    }).compile();

    service = module.get<Gpt4allService>(Gpt4allService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
