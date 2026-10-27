export function reviewerAttribution(review){return review?.authenticatedReviewer&&review.reviewer?.trim()?'Selected and reviewed by: '+review.reviewer.trim().replace(/\s+/g,' '):'';}
