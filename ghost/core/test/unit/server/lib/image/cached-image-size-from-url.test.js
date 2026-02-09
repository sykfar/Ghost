const assert = require('node:assert/strict');
const {assertExists} = require('../../../../utils/assertions');
const errors = require('@tryghost/errors');
const should = require('should');
const sinon = require('sinon');
const CachedImageSizeFromUrl = require('../../../../../core/server/lib/image/cached-image-size-from-url');
const InMemoryCache = require('../../../../../core/server/adapters/cache/MemoryCache');
const logging = require('@tryghost/logging');

describe('lib/image: image size cache', function () {
    let sizeOfStub;

    beforeEach(function () {
        sizeOfStub = sinon.stub();
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should read from cache, if dimensions for image are fetched already', async function () {
        const url = 'http://mysite.com/content/image/mypostcoverimage.jpg';
        let imageSizeSpy;

        sizeOfStub.resolves({
            width: 50,
            height: 50,
            type: 'jpg'
        });

        const cacheStore = new InMemoryCache();
        const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
            getImageSizeFromUrl: sizeOfStub,
            cache: cacheStore
        });

        imageSizeSpy = sizeOfStub;

        await cachedImageSizeFromUrl.getCachedImageSizeFromUrl(url);

        // first call to get result from `getImageSizeFromUrl`

        assertExists(cacheStore);
        cacheStore.get(url).should.not.be.undefined;
        const image = cacheStore.get(url);
        assertExists(image.width);
        assert.equal(image.width, 50);
        assertExists(image.height);
        assert.equal(image.height, 50);

        // second call to check if values get returned from cache
        await cachedImageSizeFromUrl.getCachedImageSizeFromUrl(url);

        assert.equal(imageSizeSpy.calledOnce, true);
        assert.equal(imageSizeSpy.calledTwice, false);

        cacheStore.get(url).should.not.be.undefined;
        const image2 = cacheStore.get(url);
        assertExists(image2.width);
        assert.equal(image2.width, 50);
        assertExists(image2.height);
        assert.equal(image2.height, 50);
    });

    it('can handle generic image-size errors', async function () {
        const url = 'http://mysite.com/content/image/mypostcoverimage.jpg';

        sizeOfStub.rejects('error');

        const cacheStore = new InMemoryCache();
        const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
            getImageSizeFromUrl: sizeOfStub,
            cache: cacheStore
        });

        const loggingStub = sinon.stub(logging, 'error');
        await cachedImageSizeFromUrl.getCachedImageSizeFromUrl(url);

        cacheStore.get(url).should.not.be.undefined;
        const image = cacheStore.get(url);
        assert.equal(image.url, 'http://mysite.com/content/image/mypostcoverimage.jpg');
        assert.equal(image.width, undefined);
        assert.equal(image.height, undefined);
        sinon.assert.calledOnce(loggingStub);
    });

    it('can handle NotFoundError error', async function () {
        const url = 'http://mysite.com/content/image/mypostcoverimage.jpg';

        sizeOfStub.rejects(new errors.NotFoundError('it iz gone mate!'));

        const cacheStore = new InMemoryCache();
        const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
            getImageSizeFromUrl: sizeOfStub,
            cache: cacheStore
        });

        await cachedImageSizeFromUrl.getCachedImageSizeFromUrl(url);

        cacheStore.get(url).should.not.be.undefined;
        const image = cacheStore.get(url);
        assert.equal(image.url, 'http://mysite.com/content/image/mypostcoverimage.jpg');
        assert.equal(image.width, undefined);
        assert.equal(image.height, undefined);
    });

    it('should return null if url is null', async function () {
        const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
            imageSize: {},
            cache: new InMemoryCache()
        });
        const url = null;
        let result;

        result = await cachedImageSizeFromUrl.getCachedImageSizeFromUrl(url);

        assert.equal(result, undefined);
    });

    describe('getImageSizeFromUrl', function () {
        it('should return cached dimensions on cache hit', async function () {
            const url = 'http://mysite.com/content/image/photo.jpg';

            sizeOfStub.resolves({width: 800, height: 600, type: 'jpg'});

            const cacheStore = new InMemoryCache();
            const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
                getImageSizeFromUrl: sizeOfStub,
                cache: cacheStore
            });

            // Populate cache via first call
            await cachedImageSizeFromUrl.getImageSizeFromUrl(url);
            assert.equal(sizeOfStub.calledOnce, true);

            // Second call should return from cache without fetching
            const result = await cachedImageSizeFromUrl.getImageSizeFromUrl(url);
            assert.equal(sizeOfStub.calledOnce, true); // still only one call
            assert.equal(result.width, 800);
            assert.equal(result.height, 600);
        });

        it('should fetch and write back to cache on cache miss', async function () {
            const url = 'http://mysite.com/content/image/photo.jpg';

            sizeOfStub.resolves({width: 1024, height: 768, type: 'png'});

            const cacheStore = new InMemoryCache();
            const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
                getImageSizeFromUrl: sizeOfStub,
                cache: cacheStore
            });

            const result = await cachedImageSizeFromUrl.getImageSizeFromUrl(url);

            assert.equal(result.width, 1024);
            assert.equal(result.height, 768);
            assert.equal(sizeOfStub.calledOnce, true);

            // Verify it was written to cache
            const cached = cacheStore.get(url);
            assert.equal(cached.width, 1024);
            assert.equal(cached.height, 768);
        });

        it('should retry fetch when cache has an error entry (no dimensions)', async function () {
            const url = 'http://mysite.com/content/image/photo.jpg';

            sizeOfStub.resolves({width: 500, height: 400, type: 'jpg'});

            const cacheStore = new InMemoryCache();
            // Pre-populate cache with an error entry (no width/height)
            cacheStore.set(url, {url});

            const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
                getImageSizeFromUrl: sizeOfStub,
                cache: cacheStore
            });

            const result = await cachedImageSizeFromUrl.getImageSizeFromUrl(url);

            assert.equal(result.width, 500);
            assert.equal(result.height, 400);
            assert.equal(sizeOfStub.calledOnce, true);

            // Verify cache was overwritten with valid dimensions
            const cached = cacheStore.get(url);
            assert.equal(cached.width, 500);
            assert.equal(cached.height, 400);
        });

        it('should throw on fetch error', async function () {
            const url = 'http://mysite.com/content/image/broken.jpg';

            sizeOfStub.rejects(new errors.InternalServerError({
                message: 'Request timed out.',
                code: 'IMAGE_SIZE_URL'
            }));

            const cacheStore = new InMemoryCache();
            const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
                getImageSizeFromUrl: sizeOfStub,
                cache: cacheStore
            });

            await assert.rejects(
                () => cachedImageSizeFromUrl.getImageSizeFromUrl(url),
                (err) => {
                    assert.equal(err.code, 'IMAGE_SIZE_URL');
                    return true;
                }
            );
        });

        it('should not write error entries to cache on fetch failure', async function () {
            const url = 'http://mysite.com/content/image/broken.jpg';

            sizeOfStub.rejects(new Error('Network error'));

            const cacheStore = new InMemoryCache();
            const cachedImageSizeFromUrl = new CachedImageSizeFromUrl({
                getImageSizeFromUrl: sizeOfStub,
                cache: cacheStore
            });

            try {
                await cachedImageSizeFromUrl.getImageSizeFromUrl(url);
            } catch (e) {
                // expected
            }

            // Cache should NOT have an entry — errors are not cached
            assert.equal(cacheStore.get(url), undefined);
        });
    });
});
