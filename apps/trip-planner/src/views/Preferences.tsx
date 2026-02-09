import React, {useState, useEffect} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input} from '@tryghost/shade';
import {useReadPreferences, useUpdatePreferences} from '@hooks/useTrips';
import {useNavigate} from '@tryghost/admin-x-framework';

const Preferences: React.FC = () => {
    const navigate = useNavigate();
    const {data, isLoading} = useReadPreferences('me', {enabled: true});
    const {mutateAsync: updatePreferences, isLoading: saving} = useUpdatePreferences();

    const prefs = data?.member_preferences?.[0];

    const [travelMode, setTravelMode] = useState('');
    const [pace, setPace] = useState('');
    const [homeCity, setHomeCity] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        if (prefs) {
            setTravelMode(prefs.preferred_travel_mode || '');
            setPace(prefs.preferred_pace || '');
            setHomeCity(prefs.home_city || '');
            setCategories(prefs.preferred_categories || []);
        }
    }, [prefs]);

    const handleSave = async () => {
        await updatePreferences({
            memberId: 'me',
            data: {
                preferred_travel_mode: travelMode || null,
                preferred_pace: (pace || null) as 'relaxed' | 'moderate' | 'intensive' | null,
                home_city: homeCity || null,
                preferred_categories: categories.length > 0 ? categories : null
            }
        });
    };

    const CATEGORY_OPTIONS = ['sight', 'museum', 'restaurant', 'hotel', 'park', 'custom'];

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Travel Preferences</h1>
                <Button variant="ghost" onClick={() => navigate('/trips')}>
                    Back to Trips
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Defaults</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Preferred Travel Mode</label>
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={travelMode}
                            onChange={e => setTravelMode(e.target.value)}
                        >
                            <option value="">No preference</option>
                            <option value="foot">Walking</option>
                            <option value="car">Car</option>
                            <option value="bike">Bike</option>
                            <option value="public_transport">Public Transport</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Preferred Pace</label>
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={pace}
                            onChange={e => setPace(e.target.value)}
                        >
                            <option value="">No preference</option>
                            <option value="relaxed">Relaxed</option>
                            <option value="moderate">Moderate</option>
                            <option value="intensive">Intensive</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Home City</label>
                        <Input
                            placeholder="e.g. Vienna"
                            value={homeCity}
                            onChange={e => setHomeCity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Preferred Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`rounded-full border px-3 py-1 text-sm capitalize ${
                                        categories.includes(cat)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                    }`}
                                    onClick={() => toggleCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button disabled={saving} onClick={handleSave}>
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Preferences;
