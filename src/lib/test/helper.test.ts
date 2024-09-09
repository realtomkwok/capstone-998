import logger from './logger'
import { startLLMProcess } from '@lib/helper';
import { LLMProvider, LLMOutput } from '@lib/interface';

jest.mock('../helper', () => ({
    ...jest.requireActual('@lib/helper'),
    loadUrl: jest.fn(),
    splitDocument: jest.fn(),
    embedDocuments: jest.fn(),
    createDocumentChain: jest.fn(),
}));

jest.setTimeout(60000);

describe('startLLMProcess', () => {
    const mockUrl = 'https://www.abc.net.au/news'
    const mockProvider: LLMProvider = 'openai'
    const mockChunkSize = 1000
    const mockChunkOverlap = 200

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should process the LLM pipeline successfully', async () => {
        // Mock implementations
        const mockLoadUrl = jest.requireMock('@lib/helper').loadUrl
        mockLoadUrl.mockResolvedValue({
            html: 'mock html',
            markdown: 'mock markdown',
            links: ['mock link 1', 'mock link 2'],
            metadata: 'mock metadata',
        })

        const mockSplitDocument = jest.requireMock('@lib/helper').splitDocument
        mockSplitDocument.mockResolvedValue(['mock html chunk', 'mock markdown chunk'])

        const mockEmbedDocuments = jest.requireMock('@lib/helper').embedDocuments
        mockEmbedDocuments.mockResolvedValue('mock retriever')

        const mockCreateDocumentChain = jest.requireMock('@lib/helper').createDocumentChain
        mockCreateDocumentChain.mockResolvedValue({
            chain: {
                invoke: jest.fn().mockResolvedValue({
                    response: 'mock response',
                    metadata: 'mock metadata',
                    screenshot: 'mock screenshot'
                } as unknown as LLMOutput)
            },
            formatInstructions: 'mock instructions'
        })

        // Start timer
        const startTime = performance.now()

        try {
            logger.info('Starting LLM process')

            const result = await startLLMProcess(mockUrl, mockProvider, mockChunkSize, mockChunkOverlap)

            logger.info('LLM process completed')
            expect(result).toEqual({
                "answer": expect.any(String),
                "pageLayout": {
                    "description": expect.any(String),
                    "sections": expect.any(Array)
                },
                "navigation": expect.arrayContaining([
                    {
                        "description": expect.any(String),
                        "name": expect.any(String),
                        "url": expect.any(String)
                    }
                ]),
                "topStories": expect.arrayContaining([
                    {
                        "description": expect.any(String),
                        "ogTitle": expect.any(String),
                        "title": expect.any(String),
                        "url": expect.any(String)
                    }
                ])
            })

            // // Verify all mock functions were called with the correct parameters
            // expect(mockLoadUrl).toHaveBeenCalledWith(mockUrl)
            // expect(mockSplitDocument).toHaveBeenCalledWith('mock html', 'mock markdown', mockChunkSize, mockChunkOverlap)
            // expect(mockEmbedDocuments).toHaveBeenCalledWith(['mock html chunk', 'mock markdown chunk'])
            // expect(mockCreateDocumentChain).toHaveBeenCalledWith(mockProvider)
            
        } catch (error) {
            logger.error('Error in LLM process', error)
            throw error
        } finally {
            const endTime = performance.now()
            const duration = endTime - startTime
            logger.info(`LLM process completed in ${duration.toFixed(2)}ms`)
        }
    })
})