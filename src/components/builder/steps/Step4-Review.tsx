'use client'

interface Step4Props {
  data: any
  onChange: (data: any) => void
}

export function Step4Review({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review Your Website</h2>
        <p className="text-gray-600">
          Take a moment to review your choices before generating the preview
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📋</span>
          <span>Basic Information</span>
        </h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-600">Business Name:</dt>
            <dd className="font-medium">{data.businessName || 'Not provided'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Email:</dt>
            <dd className="font-medium">{data.email || 'Not provided'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Tagline:</dt>
            <dd className="font-medium">{data.tagline || 'Not provided'}</dd>
          </div>
          {data.phone && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Phone:</dt>
              <dd className="font-medium">{data.phone}</dd>
            </div>
          )}
          {data.location && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Location:</dt>
              <dd className="font-medium">{data.location}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Category */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>🏷️</span>
          <span>Business Category</span>
        </h3>
        <p className="text-gray-700 capitalize">{data.businessCategory?.replace('-', ' ') || 'Not selected'}</p>
      </div>

      {/* Sections */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>🔨</span>
          <span>Page Sections ({data.sections?.length || 0})</span>
        </h3>
        {data.sections && data.sections.length > 0 ? (
          <ul className="space-y-2">
            {data.sections.map((section: any, index: number) => (
              <li key={section.id} className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium capitalize">{section.purpose}</p>
                  <p className="text-sm text-gray-600">{section.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No sections added yet</p>
        )}
      </div>

      {/* Call to action */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
        <p className="text-lg mb-2">
          Ready to see your website come to life?
        </p>
        <p className="text-gray-600 text-sm">
          Click &#39;Generate Preview&#39; below to create your professional website
        </p>
      </div>
    </div>
  )
}
