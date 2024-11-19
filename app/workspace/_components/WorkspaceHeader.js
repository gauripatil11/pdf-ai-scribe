"use client"

import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React, { useState } from 'react'

function WorkspaceHeader({ fileName }) {
  const [fileContent, setFileContent] = useState('');

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.txt`; 
    link.click();
  };


  return (
    <div className=' p-4 flex justify-between shadow-md'>
      <Image src={'/logo.svg'} alt='logo' width={140} height={100} />
      <h2 className=' font-bold'>{fileName}</h2>
      <div className=' flex gap-2 items-center'>
        <Button onClick={handleDownload}>Save</Button>
        <UserButton />
      </div>
    </div>
  )
}

export default WorkspaceHeader