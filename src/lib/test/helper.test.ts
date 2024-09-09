/// <reference types="jest" />;
import logger from './logger'
import { startLLMProcess } from '@lib/helper';
import { LLMProvider, LLMOutput } from '@lib/interface';
import exp from 'constants';

jest.mock('../helper', () => ({
    ...jest.requireActual('@lib/helper'),
    loadUrl: jest.fn(),
    splitDocument: jest.fn(),
    embedDocuments: jest.fn(),
    createDocumentChain: jest.fn(),
    getAnswerFromLLM: jest.fn(),
}));

describe('startLLMProcess', () => {
    const mockUrl = 'https://www.abc.net.au/news'
    const mockProvider: LLMProvider = 'openai'
    const mockChunkSize = 100
    const mockChunkOverlap = 10
    const mockK = 5
    const mockSearchType = 'similarity'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should process the LLM pipeline successfully', async () => {
        // Mock implementations
        const mockLoadUrl = jest.requireMock('@lib/helper').loadUrl
        mockLoadUrl.mockResolvedValue({
            markdown: 'mock markdown',
            html: 'mock html'
        })

        const mockSplitDocument = jest.requireMock('@lib/helper').splitDocument
        mockSplitDocument.mockResolvedValue(['mock html chunk', 'mock markdown chunk'])

        const mockEmbedDocuments = jest.requireMock('@lib/helper').embedDocuments
        mockEmbedDocuments.mockResolvedValue('mock retriever')

        const mockCreateDocumentChain = jest.requireMock('@lib/helper').createDocumentChain
        mockCreateDocumentChain.mockResolvedValue({
            chain: {
                invoke: jest.fn().mockResolvedValue('mock result')
            },
            formatInstruction: 'mock instruction'
        })

        // Start timer
        const startTime = performance.now()

        try {
            logger.info('Starting LLM process')

            const result = await startLLMProcess(mockUrl, mockProvider, mockChunkSize, mockChunkOverlap, mockK, mockSearchType)

            logger.info('LLM process completed')
            expect(result).toEqual({ result: 'mock result' })

            // Verify all mock functions were called with the correct parameters
            expect(mockLoadUrl).toHaveBeenCalledWith(mockUrl)
            expect(mockSplitDocument).toHaveBeenCalledWith('mock html', 'mock markdown', mockChunkSize, mockChunkOverlap)
            expect(mockEmbedDocuments).toHaveBeenCalledWith(['mock html chunk', 'mock markdown chunk'], mockK, mockSearchType)
            expect(mockCreateDocumentChain).toHaveBeenCalledWith('mock retriever')
        } catch (error) {
            logger.error('Error in LLM process', error)
            throw error
        } finally {
            const endTime = performance.now()
            const duration = endTime - startTime
            logger.info(`LLM process completed in ${duration.toFixed(2)}ms`)
        }
    })

    it('should handle error in LLM process', async () => {
        // Mock an error in loadUrl
        const mockLoadUrl = jest.requireMock('@lib/helper').loadUrl
        mockLoadUrl.mockRejectedValue(new Error('Failed to load URL'))

        await expect(startLLMProcess(mockUrl, mockProvider, mockChunkSize, mockChunkOverlap, mockK, mockSearchType)).rejects.toThrow('Failed to load URL')

        expect(logger.error).toHaveBeenCalledWith('Error in LLM process', expect.any(Error))
    })
})