// This file should be imported dynamically using either `next/dynamic` or `React.lazy`
// As everything in here can load while the user is figuring out which strategy to use

import Celebrate from './Celebrate'
import DemoVerifiableCredentials from './DemoVerifiableCredentials'
import FetchVerifiableCredentials from './FetchVerifiableCredentials'
import ParseVerifiableCredentials from './ParseVerifiableCredentials'
import ScrollTo from './ScrollTo'
import CounterfeitCredentials from './CounterfeitCredentials'
import ValidateLinkedData from './ValidateLinkedData'
import VerifyCredentials from './VerifyCredentials'
import VerifyPresentation from './VerifyPresentation'

export default function LazyBunch() {
  return (
    <>
      <FetchVerifiableCredentials />
      <ParseVerifiableCredentials />
      <DemoVerifiableCredentials />
      <ValidateLinkedData />
      <VerifyCredentials />
      <CounterfeitCredentials />
      <VerifyPresentation />
      <ScrollTo />
      <Celebrate />
    </>
  )
}
