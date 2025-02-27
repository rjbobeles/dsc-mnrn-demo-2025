import fs from 'fs'
import { join } from 'path'

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ChatMessage, CompletionResult, createCompletion, createCompletionStream, InferenceModel, loadModel } from 'gpt4all'

@Injectable()
export class Gpt4AllService implements OnModuleInit, OnModuleDestroy {
  private model?: InferenceModel

  private readonly modelPath = join(process.cwd(), 'models')

  public async onModuleDestroy() {
    if (this.model) this.model.dispose()
  }

  public async onModuleInit() {
    if (!fs.existsSync(this.modelPath)) {
      Logger.error('models directory not found', 'GPT4All')
      process.exit(1)
    }

    this.model = await loadModel('DeepSeek-R1-Distill-Qwen-7B-Q4_0.gguf', {
      modelPath: this.modelPath,
      verbose: false,
      device: 'cpu',
      nCtx: 2048,
    })

    if (this.model) Logger.log(`Successfully loaded ${this.model.modelName}`, 'GPT4All')
  }

  public async create_completion(chat: ChatMessage[]): Promise<CompletionResult> {
    return createCompletion(this.model, chat)
  }

  public async create_completion_stream(chat: ChatMessage[]): Promise<{
    stream: { tokens: NodeJS.ReadableStream; result: Promise<CompletionResult> }
    waitForCompletion: () => Promise<CompletionResult>
  }> {
    const stream = createCompletionStream(this.model, chat)

    return {
      stream,
      async waitForCompletion() {
        return stream.result
      },
    }
  }
}
