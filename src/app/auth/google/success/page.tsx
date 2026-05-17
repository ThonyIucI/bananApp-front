'use client';

import { Suspense } from 'react';

import { GoogleSuccessComponent } from '.';


const GoogleSuccessPage = () => {

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" />}>
      <GoogleSuccessComponent />
    </Suspense>

  );
};

export default GoogleSuccessPage;
