// This is a temporary workaround for an issue with the embla-carousel-react library and Next.js 15
// It can be removed once the library is updated.
// See: https://github.com/davidjerleke/embla-carousel/issues/732

'use client'
import emblaCarouselReact from 'embla-carousel-react'

export const useEmblaCarousel = emblaCarouselReact
