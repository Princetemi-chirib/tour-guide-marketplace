export function formatUser(doc) {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

export function formatTour(doc, guideName) {
  return {
    id: doc.id,
    guideId: doc.guideId,
    title: doc.title,
    description: doc.description,
    price: doc.price,
    location: doc.location,
    duration: doc.duration,
    imageUrl: doc.imageUrl,
    featured: Boolean(doc.featured),
    guideName: guideName ?? undefined,
    createdAt: doc.createdAt,
  };
}

export function formatBooking(doc, extras = {}) {
  return {
    id: doc.id,
    tourId: doc.tourId,
    userId: doc.userId,
    date: doc.date,
    peopleCount: doc.peopleCount,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    createdAt: doc.createdAt,
    tourTitle: extras.tourTitle,
    tourLocation: extras.tourLocation,
    tourImageUrl: extras.tourImageUrl,
    travelerName: extras.travelerName,
    travelerEmail: extras.travelerEmail,
  };
}
