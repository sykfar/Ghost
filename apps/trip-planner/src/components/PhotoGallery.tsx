import React, {useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input} from '@tryghost/shade';
import {useBrowsePhotos, useAddPhoto, useDeletePhoto} from '@hooks/useTrips';
import type {TripPhoto} from '@app-types/trip';

interface PhotoGalleryProps {
    tripId: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({tripId}) => {
    const {data, refetch} = useBrowsePhotos(tripId, {enabled: !!tripId});
    const {mutateAsync: addPhoto, isLoading: adding} = useAddPhoto();
    const {mutateAsync: deletePhoto} = useDeletePhoto();

    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');

    const photos: TripPhoto[] = data?.trip_photos || [];

    const handleAdd = async () => {
        if (!imageUrl.trim()) {
            return;
        }
        await addPhoto({tripId, image_url: imageUrl, caption: caption || undefined});
        setImageUrl('');
        setCaption('');
        refetch();
    };

    const handleDelete = async (photoId: string) => {
        await deletePhoto({tripId, photoId});
        refetch();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Photos ({photos.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add photo form */}
                <div className="space-y-2 rounded-md border p-3">
                    <Input
                        placeholder="Image URL"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                    />
                    <Input
                        placeholder="Caption (optional)"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                    />
                    <Button size="sm" disabled={adding || !imageUrl.trim()} onClick={handleAdd}>
                        {adding ? 'Adding...' : 'Add Photo'}
                    </Button>
                </div>

                {/* Photo grid */}
                {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map(photo => (
                            <div key={photo.id} className="group relative overflow-hidden rounded-md border">
                                <img
                                    src={photo.image_url}
                                    alt={photo.caption || 'Trip photo'}
                                    className="aspect-square w-full object-cover"
                                    onError={e => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14">No image</text></svg>';
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    {photo.caption && (
                                        <p className="text-xs text-white">{photo.caption}</p>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/30 p-0 text-white opacity-0 hover:bg-red-500 group-hover:opacity-100"
                                    onClick={() => handleDelete(photo.id)}
                                >
                                    x
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {photos.length === 0 && (
                    <p className="text-center text-xs text-gray-400">No photos yet</p>
                )}
            </CardContent>
        </Card>
    );
};

export default PhotoGallery;
