import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file, fileName, fileType } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual AI API call
    // For now, return mock extracted data
    // The real implementation would:
    // 1. Send the base64 file to Claude/GPT Vision API
    // 2. Parse the AI response
    // 3. Return structured data

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock extracted data based on file name
    const isMyKad = fileName.toLowerCase().includes('mykad') || fileName.toLowerCase().includes('ic');
    const isPassport = fileName.toLowerCase().includes('passport');

    const mockData = isMyKad
      ? {
          document_type: 'MyKad',
          full_name: 'Ahmad bin Ibrahim',
          ic_number: '880515-14-5678',
          address: '123 Jalan Bukit Bintang, 55100 Kuala Lumpur',
          date_of_birth: '1988-05-15',
          gender: 'Male',
          nationality: 'Malaysian',
        }
      : isPassport
      ? {
          document_type: 'Passport',
          full_name: 'John Michael Smith',
          passport_number: 'N12345678',
          date_of_birth: '1990-03-22',
          expiry_date: '2028-06-20',
          nationality: 'United States',
          issuing_country: 'USA',
        }
      : {
          document_type: 'Unknown',
          full_name: 'Extracted Name',
          document_number: 'DOC-123456',
          date_of_birth: '1995-01-01',
        };

    return NextResponse.json({
      success: true,
      extractedData: mockData,
      confidence: 0.95,
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
