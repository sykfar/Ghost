import React, {useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Textarea} from '@tryghost/shade';
import {useBrowseReviews, useAddReview, useDeleteReview} from '@hooks/useTrips';
import type {TripReview} from '@app-types/trip';

interface ReviewPanelProps {
    tripId: string;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

const StarRating: React.FC<{value: number; onChange?: (v: number) => void; readonly?: boolean}> = ({value, onChange, readonly}) => {
    return (
        <div className="flex gap-0.5">
            {STAR_VALUES.map(star => (
                <button
                    key={star}
                    type="button"
                    className={`text-lg ${readonly ? 'cursor-default' : 'cursor-pointer'} ${star <= value ? 'text-yellow-500' : 'text-gray-300'}`}
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const ReviewPanel: React.FC<ReviewPanelProps> = ({tripId}) => {
    const {data, refetch} = useBrowseReviews(tripId, {enabled: !!tripId});
    const {mutateAsync: addReview, isLoading: adding} = useAddReview();
    const {mutateAsync: deleteReview} = useDeleteReview();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const reviews: TripReview[] = data?.trip_reviews || [];

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            return;
        }
        await addReview({tripId, rating, comment: comment || undefined});
        setComment('');
        setRating(5);
        refetch();
    };

    const handleDelete = async (reviewId: string) => {
        await deleteReview(reviewId);
        refetch();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add review form */}
                <div className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Your rating:</span>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <Textarea
                        placeholder="Write a review..."
                        rows={2}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <Button size="sm" disabled={adding} onClick={handleSubmit}>
                        {adding ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>

                {/* Existing reviews */}
                {reviews.map(review => (
                    <div key={review.id} className="space-y-1 border-b pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                            <StarRating value={review.rating} readonly />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs text-red-500"
                                onClick={() => handleDelete(review.id)}
                            >
                                Delete
                            </Button>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-gray-600">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <p className="text-center text-xs text-gray-400">No reviews yet</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewPanel;
