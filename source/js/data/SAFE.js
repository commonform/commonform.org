var Immutable = require('immutable');
module.exports = Immutable.fromJS(
/* jscs:disable */
/* jshint ignore: start */
{
  "content": [
    {
      "form": {
        "conspicuous": "true",
        "content": [
          "This instrument and any securities issuable pursuant hereto have not been registered under the Securities Act of 1933, as amended (the ",
          {
            "definition": "Act"
          },
          "), or under the securities laws of certain states. These securities may not be offered, sold or otherwise transferred, pledged or hypothecated except as permitted under the act and applicable state securities laws pursuant to an effective registration statement or an exemption therefrom."
        ]
      }
    },
    {
      "form": {
        "content": [
          "This certifies that in exchange for the payment by ",
          {
            "field": "Investor Name"
          },
          " (the ",
          {
            "definition": "Investor"
          },
          ") of ",
          {
            "field": "Purchase Amount"
          },
          " (the ",
          {
            "definition": "Purchase Amount"
          },
          ") on or about ",
          {
            "field": "Purchase Date"
          },
          ", ",
          {
            "field": "Company Name"
          },
          ", a ",
          {
            "field": "Company Legal Form"
          },
          " (the ",
          {
            "definition": "Company"
          },
          "), hereby issues to the ",
          {
            "use": "Investor"
          },
          " the right to certain shares of the ",
          {
            "use": "Company"
          },
          "'s capital stock, subject to the terms set forth below."
        ]
      }
    },
    {
      "form": {
        "content": [
          {
            "form": {
              "content": [
                "If there is an ",
                {
                  "use": "Equity Financing"
                },
                " before the expiration or termination of this instrument, the ",
                {
                  "use": "Company"
                },
                " will automatically issue to the ",
                {
                  "use": "Investor"
                },
                " a number of shares of preferred stock sold in the ",
                {
                  "use": "Equity Financing"
                },
                " equal to the ",
                {
                  "use": "Purchase Amount"
                },
                " divided by the price per share of the preferred stock. In connection with the issuance of such shares of preferred stock by the ",
                {
                  "use": "Company"
                },
                " to the ",
                {
                  "use": "Investor"
                },
                " pursuant to this provision:",
                {
                  "form": {
                    "content": [
                      "The ",
                      {
                        "use": "Investor"
                      },
                      " will execute and deliver to the ",
                      {
                        "use": "Company"
                      },
                      " all transaction documents related to the ",
                      {
                        "use": "Equity Financing"
                      },
                      "; provided, that such transaction documents are the same documents to be entered into with the purchasers of the preferred stock;"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "The ",
                      {
                        "use": "Investor"
                      },
                      " and the ",
                      {
                        "use": "Company"
                      },
                      " will execute a ",
                      {
                        "use": "Pro Rata Rights Agreement"
                      },
                      ", unless the ",
                      {
                        "use": "Investor"
                      },
                      " is already included in such rights in the transaction documents related to the ",
                      {
                        "use": "Equity Financing"
                      },
                      "; and"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "This instrument will expire and terminate."
                    ]
                  }
                }
              ]
            },
            "summary": "Equity Financing"
          },
          {
            "form": {
              "content": [
                "If there is a ",
                {
                  "use": "Liquidity Event"
                },
                " before the expiration or termination of this instrument, the ",
                {
                  "use": "Investor"
                },
                " will, at its option, either",
                {
                  "form": {
                    "content": [
                      "receive a cash payment equal to the ",
                      {
                        "use": "Purchase Amount"
                      },
                      " (subject to ",
                      {
                        "reference": "Automatic Conversion"
                      },
                      ") or"
                    ]
                  },
                  "summary": "Cash Payment"
                },
                {
                  "form": {
                    "content": [
                      "automatically receive from the ",
                      {
                        "use": "Company"
                      },
                      " a number of shares of ",
                      {
                        "use": "Common Stock"
                      },
                      " equal to the ",
                      {
                        "use": "Purchase Amount"
                      },
                      " divided by the fair market value of the ",
                      {
                        "use": "Common Stock"
                      },
                      " at the time of the ",
                      {
                        "use": "Liquidity Event"
                      },
                      " (determined by reference to the purchase price payable in connection with such ",
                      {
                        "use": "Liquidity Event"
                      },
                      ") (the ",
                      {
                        "definition": "Liquidity Price"
                      },
                      "), if the ",
                      {
                        "use": "Investor"
                      },
                      " fails to select the cash option. Thereafter, this instrument will expire and terminate."
                    ]
                  },
                  "summary": "Automatic Conversion"
                },
                "In connection with ",
                {
                  "reference": "Cash Payment"
                },
                ", the ",
                {
                  "use": "Purchase Amount"
                },
                " will be due and payable by the ",
                {
                  "use": "Company"
                },
                " to the ",
                {
                  "use": "Investor"
                },
                " immediately prior to, or concurrent with, the consummation of the ",
                {
                  "use": "Liquidity Event"
                },
                ". If there are not enough funds to pay the ",
                {
                  "use": "Investor"
                },
                " and holders of other ",
                {
                  "use": "SAFE"
                },
                "s (collectively, the ",
                {
                  "definition": "Cash-Out Investors"
                },
                ") in full, then all of the ",
                {
                  "use": "Company"
                },
                "'s available funds will be distributed with equal priority and pro rata among the ",
                {
                  "use": "Cash-Out Investors"
                },
                " in proportion to their ",
                {
                  "use": "Purchase Amount"
                },
                "s, and the ",
                {
                  "use": "Cash-Out Investors"
                },
                " will automatically receive the number of shares of ",
                {
                  "use": "Common Stock"
                },
                " equal to the remaining unpaid ",
                {
                  "use": "Purchase Amount"
                },
                " divided by the ",
                {
                  "use": "Liquidity Price"
                },
                ". In connection with a ",
                {
                  "use": "Change of Control"
                },
                " intended to qualify as a tax-free reorganization, the ",
                {
                  "use": "Company"
                },
                " may reduce, pro rata, the ",
                {
                  "use": "Purchase Amount"
                },
                "s payable to the ",
                {
                  "use": "Cash-Out Investors"
                },
                " by the amount determined by its board of directors in good faith to be advisable for such ",
                {
                  "use": "Change of Control"
                },
                " to qualify as a tax-free reorganization for U.S. federal income tax purposes, and in such case, the ",
                {
                  "use": "Cash-Out Investors"
                },
                " will automatically receive the number of shares of ",
                {
                  "use": "Common Stock"
                },
                " equal to the remaining unpaid ",
                {
                  "use": "Purchase Amount"
                },
                " divided by the ",
                {
                  "use": "Liquidity Price"
                },
                "."
              ]
            },
            "summary": "Liquidity Event"
          },
          {
            "form": {
              "content": [
                "If there is a ",
                {
                  "use": "Dissolution Event"
                },
                " before this instrument expires or terminates, the ",
                {
                  "use": "Company"
                },
                " will pay the ",
                {
                  "use": "Investor"
                },
                " an amount equal to the ",
                {
                  "use": "Purchase Amount"
                },
                ", due and payable to the ",
                {
                  "use": "Investor"
                },
                " immediately prior to, or concurrent with, the consummation of the ",
                {
                  "use": "Dissolution Event"
                },
                ". The ",
                {
                  "use": "Purchase Amount"
                },
                " will be paid prior and in preference to any ",
                {
                  "use": "Distribution"
                },
                " of any of the assets of the ",
                {
                  "use": "Company"
                },
                " to holders of the ",
                {
                  "use": "Company"
                },
                "'s capital stock by reason of their ownership of such stock. If immediately prior to the consummation of the ",
                {
                  "use": "Dissolution Event"
                },
                ", the assets of the ",
                {
                  "use": "Company"
                },
                " legally available for distribution to the ",
                {
                  "use": "Investor"
                },
                " and all holders of all other ",
                {
                  "use": "SAFE"
                },
                "s (the ",
                {
                  "definition": "Dissolving Investors"
                },
                "), as determined in good faith by the ",
                {
                  "use": "Company"
                },
                "'s board of directors, are insufficient to permit the payment to the ",
                {
                  "use": "Dissolving Investors"
                },
                " of their respective ",
                {
                  "use": "Purchase Amount"
                },
                "s, then the entire assets of the ",
                {
                  "use": "Company"
                },
                " legally available for distribution will be distributed with equal priority and pro rata among the ",
                {
                  "use": "Dissolving Investors"
                },
                " in proportion to the ",
                {
                  "use": "Purchase Amount"
                },
                "s they would otherwise be entitled to receive pursuant to this provision. After the payment, or setting aside payment, to the ",
                {
                  "use": "Investor"
                },
                ", this instrument will expire and terminate."
              ]
            },
            "summary": "Dissolution Event"
          }
        ]
      },
      "summary": "Events"
    },
    {
      "form": {
        "content": [
          {
            "form": {
              "content": [
                {
                  "definition": "Change of Control"
                },
                " means",
                {
                  "form": {
                    "content": [
                      "a transaction or series of related transactions in which any \"person\" or \"group\" (within the meaning of Section 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended), becomes the \"beneficial owner\" (as defined in Rule 13d-3 under the Securities Exchange Act of 1934, as amended), directly or indirectly, of more than ",
                      {
                        "field": "Change of Control Voting Block Threshold"
                      },
                      " of the outstanding voting securities of the ",
                      {
                        "use": "Company"
                      },
                      " having the right to vote for the election of members of the ",
                      {
                        "use": "Company"
                      },
                      "'s board of directors,"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "any reorganization, merger or consolidation of the ",
                      {
                        "use": "Company"
                      },
                      ", other than a transaction or series of related transactions in which the holders of the voting securities of the ",
                      {
                        "use": "Company"
                      },
                      " outstanding immediately prior to such transaction or series of related transactions retain, immediately after such transaction or series of related transactions, at least a majority of the total voting power represented by the outstanding voting securities of the ",
                      {
                        "use": "Company"
                      },
                      " or such other surviving or resulting entity or"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "a sale, lease or other disposition of all or substantially all of the assets of the ",
                      {
                        "use": "Company"
                      },
                      "."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Common Stock"
                },
                " means the common stock of the ",
                {
                  "use": "Company"
                },
                "."
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Distribution"
                },
                " means the transfer to holders of the ",
                {
                  "use": "Company"
                },
                "'s capital stock by reason of their ownership of such stock of cash or other property without consideration whether by way of dividend or otherwise, other than dividends on the ",
                {
                  "use": "Common Stock"
                },
                " payable in ",
                {
                  "use": "Common Stock"
                },
                ", or the purchase or redemption of shares of the ",
                {
                  "use": "Company"
                },
                " by the ",
                {
                  "use": "Company"
                },
                " or its subsidiaries for cash or property other than:",
                {
                  "form": {
                    "content": [
                      "repurchases of the ",
                      {
                        "use": "Common Stock"
                      },
                      " issued to or held by employees, officers, directors or consultants of the ",
                      {
                        "use": "Company"
                      },
                      " or its subsidiaries upon termination of their employment or services pursuant to agreements providing for the right of said repurchase,"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "repurchases of ",
                      {
                        "use": "Common Stock"
                      },
                      " issued to or held by employees, officers, directors or consultants of the ",
                      {
                        "use": "Company"
                      },
                      " or its subsidiaries pursuant to rights of first refusal contained in agreements providing for such right and"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "repurchases of capital stock of the ",
                      {
                        "use": "Company"
                      },
                      " in connection with the settlement of disputes with any stockholder."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Dissolution Event"
                },
                " means",
                {
                  "form": {
                    "content": [
                      "a voluntary termination of operations,"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "a general assignment for the benefit of the ",
                      {
                        "use": "Company"
                      },
                      "'s creditors or"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "any other liquidation, dissolution or winding up of the ",
                      {
                        "use": "Company"
                      },
                      " (excluding a ",
                      {
                        "use": "Liquidity Event"
                      },
                      "), whether voluntary or involuntary."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Equity Financing"
                },
                " means a bona fide transaction or series of transactions with the principal purpose to raise capital, pursuant to which the ",
                {
                  "use": "Company"
                },
                " issues and sells shares of preferred stock of the ",
                {
                  "use": "Company"
                },
                " at a fixed pre-money valuation with an aggregate sales price of not less than ",
                {
                  "field": "Equity Financing Purchase Price Threshold"
                },
                " (exluding all ",
                {
                  "use": "Subsequent Convertible Securities"
                },
                ")."
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Initial Public Offering"
                },
                " means the closing of the ",
                {
                  "use": "Company"
                },
                "'s first firm commitment underwritten initial public offering of the ",
                {
                  "use": "Common Stock"
                },
                " pursuant to a registration statement filed under the Securities Act of 1933, as amended (the ",
                {
                  "definition": "Securities Act"
                },
                ")."
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Liquidity Capitalization"
                },
                " means all shares of the ",
                {
                  "use": "Company"
                },
                "'s capital stock (on an as-converted basis) issued and outstanding, assuming exercise or conversion of all outstanding vested and unvested options, warrants and other convertible securities, but excluding:",
                {
                  "form": {
                    "content": [
                      "all shares of the ",
                      {
                        "use": "Common Stock"
                      },
                      " reserved and available for future grant under any equity incentive or similar plan of the ",
                      {
                        "use": "Company"
                      },
                      ";"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "this instrument;"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "all other ",
                      {
                        "use": "SAFE"
                      },
                      "s; and"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "convertible promissory notes."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Liquidity Event"
                },
                " means a ",
                {
                  "use": "Change of Control"
                },
                " or an ",
                {
                  "use": "Initial Public Offering"
                },
                "."
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "Pro Rata Rights Agreement"
                },
                " means a written agreement between the ",
                {
                  "use": "Company"
                },
                " and the ",
                {
                  "use": "Investor"
                },
                " (and holders of other ",
                {
                  "use": "SAFE"
                },
                "s, as appropriate) giving the ",
                {
                  "use": "Investor"
                },
                " a right to purchase its pro rata share of private placements of securities by the ",
                {
                  "use": "Company"
                },
                " occurring after the ",
                {
                  "use": "Equity Financing"
                },
                ", subject to customary exceptions. Pro rata for purposes of the ",
                {
                  "use": "Pro Rata Rights Agreement"
                },
                " will be calculated based on the ratio of",
                {
                  "form": {
                    "content": [
                      "the number of shares of capital stock of the ",
                      {
                        "use": "Company"
                      },
                      " owned by the ",
                      {
                        "use": "Investor"
                      },
                      " immediately prior to the issuance of the securities to"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "the total number of shares of outstanding capital stock of the ",
                      {
                        "use": "Company"
                      },
                      " on a fully diluted basis, calculated as of immediately prior to the issuance of the securities."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                {
                  "definition": "SAFE"
                },
                " means an instrument containing a future right to the ",
                {
                  "use": "Company"
                },
                "'s capital stock, similar in form and content to this instrument, purchased by investors for the purpose of funding the ",
                {
                  "use": "Company"
                },
                "'s business operations."
              ]
            }
          }
        ]
      },
      "summary": "Definitions"
    },
    {
      "form": {
        "content": [
          {
            "definition": "Subsequent Convertible Securities"
          },
          " means convertible securities that the ",
          {
            "use": "Company"
          },
          " may issue after the issuance of this instrument for with the principal purpose of raising capital, including but not limited to, other ",
          {
            "use": "SAFE"
          },
          "s, convertible debt instruments and other convertible securities. ",
          {
            "use": "Subsequent Convertible Securities"
          },
          " excludes",
          {
            "form": {
              "content": [
                "options issued pursuant to any equity incentive or similar plan of the ",
                {
                  "use": "Company"
                },
                ","
              ]
            }
          },
          {
            "form": {
              "content": [
                "convertible securities issued or issuable to",
                {
                  "form": {
                    "content": [
                      "banks, equipment lessors, financial institutions or other persons engaged in the business of making loans pursuant to a debt financing or commercial leasing or"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "suppliers or third party service providers in connection with the provision of goods or services pursuant to transactions and"
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                "convertible securities issued or issuable in connection with sponsored research, collaboration, technology license, development, OEM, marketing or other similar agreements or strategic partnerships."
              ]
            }
          }
        ]
      }
    },
    {
      "form": {
        "content": [
          "If the ",
          {
            "use": "Company"
          },
          " issues any ",
          {
            "use": "Subsequent Convertible Securities"
          },
          " prior to the termination of this instrument, the ",
          {
            "use": "Company"
          },
          " will promptly provide the ",
          {
            "use": "Investor"
          },
          " with written notice thereof, together with a copy of all documentation relating to such ",
          {
            "use": "Subsequent Convertible Securities"
          },
          " and, upon written request of the ",
          {
            "use": "Investor"
          },
          ", any additional information related to such ",
          {
            "use": "Subsequent Convertible Securities"
          },
          " as may be reasonably requested by the ",
          {
            "use": "Investor"
          },
          ". In the event the ",
          {
            "use": "Investor"
          },
          " determines that the terms of the ",
          {
            "use": "Subsequent Convertible Securities"
          },
          " are preferable to the terms of this instrument, the ",
          {
            "use": "Investor"
          },
          " will notify the ",
          {
            "use": "Company"
          },
          " in writing. Promptly after receipt of such written notice from the ",
          {
            "use": "Investor"
          },
          ", the ",
          {
            "use": "Company"
          },
          " agrees to amend and restate this ",
          {
            "use": "SAFE"
          },
          " to be identical to the instruments evidencing the ",
          {
            "use": "Subsequent Convertible Securities"
          },
          "."
        ]
      },
      "summary": "\"MFN\" Amendment Provision"
    },
    {
      "form": {
        "content": [
          {
            "form": {
              "content": [
                "The ",
                {
                  "use": "Company"
                },
                " is a corporation duly organized, validly existing and in good standing under the laws of the state of its incorporation, and has the power and authority to own, lease and operate its properties and carry on its business as now conducted."
              ]
            }
          },
          {
            "form": {
              "content": [
                "The execution, delivery and performance by the ",
                {
                  "use": "Company"
                },
                " of this instrument is within the power of the ",
                {
                  "use": "Company"
                },
                " and, other than with respect to the actions to be taken when equity is to be issued to the ",
                {
                  "use": "Investor"
                },
                ", has been duly authorized by all necessary actions on the part of the ",
                {
                  "use": "Company"
                },
                ". This instrument constitutes a legal, valid and binding obligation of the ",
                {
                  "use": "Company"
                },
                ", enforceable against the ",
                {
                  "use": "Company"
                },
                " in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity. To the knowledge of the ",
                {
                  "use": "Company"
                },
                ", it is not in violation of",
                {
                  "form": {
                    "content": [
                      "its current certificate of incorporation or bylaws,"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "any material statute, rule or regulation applicable to the ",
                      {
                        "use": "Company"
                      },
                      " or"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "any material indenture or contract to which the ",
                      {
                        "use": "Company"
                      },
                      " is a party or by which it is bound, where, in each case, such violation or default, individually, or together with all such violations or defaults, could reasonably be expected to have a material adverse effect on the ",
                      {
                        "use": "Company"
                      },
                      "."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                "The performance and consummation of the transactions contemplated by this instrument do not and will not:",
                {
                  "form": {
                    "content": [
                      "violate the any material judgment, statute, rule or regulation applicable to the ",
                      {
                        "use": "Company"
                      },
                      ";"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "result in the acceleration of any material indenture or contract to which the ",
                      {
                        "use": "Company"
                      },
                      " is a party or by which it is bound; or"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "result in the creation or imposition of any lien upon any property, asset or revenue of the ",
                      {
                        "use": "Company"
                      },
                      " or the suspension, forfeiture, or nonrenewal of any material permit, license or authorization applicable to the ",
                      {
                        "use": "Company"
                      },
                      ", its business or operations."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                "No consents or approvals are required in connection with the performance of this instrument, other than:",
                {
                  "form": {
                    "content": [
                      "the ",
                      {
                        "use": "Company"
                      },
                      "'s corporate approvals;"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "any qualifications or filings under applicable securities laws; and"
                    ]
                  }
                },
                {
                  "form": {
                    "content": [
                      "necessary corporate approvals for the authorization of any shares of capital stock of the ",
                      {
                        "use": "Company"
                      },
                      " issued pursuant to ",
                      {
                        "reference": "Events"
                      },
                      "."
                    ]
                  }
                }
              ]
            }
          },
          {
            "form": {
              "content": [
                "To its knowledge, the ",
                {
                  "use": "Company"
                },
                " owns or possesses (or can obtain on commercially reasonable terms) sufficient legal rights to all patents, trademarks, service marks, trade names, copyrights, trade secrets, licenses, information, processes and other intellectual property rights necessary for its business as now conducted and as currently proposed to be conducted, without any conflict with, or infringement of the rights of, others."
              ]
            }
          }
        ]
      },
      "summary": "Company Representations"
    },
    {
      "form": {
        "content": [
          {
            "form": {
              "content": [
                "The ",
                {
                  "use": "Investor"
                },
                " has full legal capacity, power and authority to execute and deliver this instrument and to perform its obligations hereunder. This instrument constitutes valid and binding obligation of the ",
                {
                  "use": "Investor"
                },
                ", enforceable in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity."
              ]
            }
          },
          {
            "form": {
              "content": [
                "The ",
                {
                  "use": "Investor"
                },
                " is an accredited investor as such term is defined in Rule 501 of Regulation D under the ",
                {
                  "use": "Securities Act"
                },
                ". The ",
                {
                  "use": "Investor"
                },
                " has been advised that this instrument and the underlying securities have not been registered under the ",
                {
                  "use": "Securities Act"
                },
                ", or any state securities laws and, therefore, cannot be resold unless they are registered under the ",
                {
                  "use": "Securities Act"
                },
                " and applicable state securities laws or unless an exemption from such registration requirements is available. The ",
                {
                  "use": "Investor"
                },
                " is purchasing this instrument and the securities to be acquired by the ",
                {
                  "use": "Investor"
                },
                " hereunder for its own account for investment, not as a nominee or agent, and not with a view to, or for resale in connection with, the distribution thereof, and the ",
                {
                  "use": "Investor"
                },
                " has no present intention of selling, granting any participation in, or otherwise distributing the same. The ",
                {
                  "use": "Investor"
                },
                " has such knowledge and experience in financial and business matters that the ",
                {
                  "use": "Investor"
                },
                " is capable of evaluating the merits and risks of such investment, is able to incur a complete loss of such investment without impairing the ",
                {
                  "use": "Investor"
                },
                "'s financial condition and is able to bear the economic risk of such investment for an indefinite period of time."
              ]
            }
          }
        ]
      },
      "summary": "Investor Representations"
    },
    {
      "form": {
        "content": [
          {
            "form": {
              "content": [
                "Any provision of this instrument may be amended, waived or modified only upon the written consent of the ",
                {
                  "use": "Company"
                },
                " and the ",
                {
                  "use": "Investor"
                },
                "."
              ]
            }
          },
          {
            "form": {
              "content": [
                "Any notice required or permitted by this instrument will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page, or ",
                {
                  "field": "Time Notice is Effective after Deposit in the Mail"
                },
                " hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address listed on the signature page, as subsequently modified by written notice."
              ]
            }
          },
          {
            "form": {
              "content": [
                "The ",
                {
                  "use": "Investor"
                },
                " is not entitled, as a holder of this instrument, to vote or receive dividends or be deemed the holder of the ",
                {
                  "use": "Company"
                },
                "'s capital stock for any purpose, nor will anything contained herein be construed to confer upon the ",
                {
                  "use": "Investor"
                },
                ", as such, any of the rights of a stockholder of the ",
                {
                  "use": "Company"
                },
                " or any right to vote for the election of directors or upon any matter submitted to stockholders at any meeting thereof, or to give or withhold consent to any corporate action or to receive notice of meetings, or to receive subscription rights or otherwise until shares have been issued upon the terms as described herein."
              ]
            }
          },
          {
            "form": {
              "content": [
                "Neither this instrument nor the rights contained herein may be assigned, by operation of law or otherwise, by either party without the prior written consent of the other; provided, however, that the rights of the ",
                {
                  "use": "Investor"
                },
                " may be assigned without the ",
                {
                  "use": "Company"
                },
                "'s consent by the ",
                {
                  "use": "Investor"
                },
                " to any other entity who directly or indirectly, controls, is controlled by or is under common control with the ",
                {
                  "use": "Investor"
                },
                ", including, without limitation, any general partner, managing member, officer or director of the ",
                {
                  "use": "Investor"
                },
                ", or any venture capital fund now or hereafter existing which is controlled by one or more general partners or managing members of, or shares the same management company with, the ",
                {
                  "use": "Investor"
                },
                "; and provided, further, that the ",
                {
                  "use": "Company"
                },
                " may assign this instrument in whole, without the consent of the ",
                {
                  "use": "Investor"
                },
                ", in connection with a reincorporation to change the ",
                {
                  "use": "Company"
                },
                "'s domicile."
              ]
            }
          },
          {
            "form": {
              "content": [
                "In the event any one or more of the provisions of this instrument is for any reason held to be invalid, illegal or unenforceable, in whole or in part or in any respect, or in the event that any one or more of the provisions of this instrument operate or would prospectively operate to invalidate this instrument, then and in any such event, such provision(s) only will be deemed null and void and will not affect any other provision of this instrument and the remaining provisions of this instrument will remain operative and in full force and effect and will not be affected, prejudiced, or disturbed thereby."
              ]
            }
          },
          {
            "form": {
              "content": [
                "All rights and obligations hereunder will be governed by the laws of the ",
                {
                  "field": "Governing Law Jurisdiction"
                },
                ", without regard to the conflicts of law provisions of such jurisdiction."
              ]
            }
          }
        ]
      },
      "summary": "Miscellaneous"
    }
  ]
}
/* jshint ignore: end */
/* jscs:enable */
);
