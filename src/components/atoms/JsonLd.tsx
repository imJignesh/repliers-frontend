import React from 'react'

const JsonLd = ({ data }: { data: object | null }) => {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  )
}

export default JsonLd
